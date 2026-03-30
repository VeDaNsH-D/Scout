const Lead = require("../schemas/lead_schema");
const Message = require("../schemas/message_schema");
const WorkflowRun = require("../schemas/workflow_run_schema");
const { indexAnalytics } = require("../services/vectorService");

const getCampaignAnalytics = async (req, res, next) => {
    try {
        const { workflowId } = req.query;

        if (workflowId && !/^[a-f\d]{24}$/i.test(workflowId)) {
            return res.status(400).json({ message: "Invalid workflowId" });
        }

        const workflowRunFilter = workflowId ? { workflow_id: workflowId } : {};
        let leadScopeFilter = {};
        let messageScopeFilter = {};

        if (workflowId) {
            const scopedRuns = await WorkflowRun.find(workflowRunFilter)
                .select("_id lead_id")
                .lean();

            const workflowRunIds = scopedRuns
                .map((run) => run?._id)
                .filter(Boolean);

            const uniqueLeadIds = Array.from(new Set(
                scopedRuns
                    .map((run) => run?.lead_id?.toString())
                    .filter(Boolean)
            ));

            const leadIds = uniqueLeadIds;

            leadScopeFilter = {
                _id: { $in: leadIds }
            };

            messageScopeFilter = {
                workflow_run_id: { $in: workflowRunIds }
            };
        }

        const sentEmailFilter = {
            ...messageScopeFilter,
            channel: "email",
            status: "sent",
            $or: [
                { direction: "outgoing" },
                { direction: { $exists: false } }
            ]
        };

        const repliedLeadFilter = {
            ...leadScopeFilter,
            status: "replied"
        };

        const convertedLeadFilter = {
            ...leadScopeFilter,
            status: "converted"
        };

        const averageScoreMatch = {
            ...leadScopeFilter,
            lead_score: { $ne: null }
        };

        // Date boundaries for trend calculations
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);

        const [
            totalLeads,
            emailsSent,
            repliedLeads,
            convertedLeads,
            newLeads,
            contactedLeads,
            runningRuns,
            completedRuns,
            failedRuns,
            averageScoreResult,
            leadsToday,
            leadsYesterday,
            emailsToday,
            emailsYesterday,
            repliesToday,
            repliesYesterday,
            conversionsToday,
            conversionsYesterday,
            recentWorkflowRuns
        ] = await Promise.all([
            Lead.countDocuments(leadScopeFilter),
            Message.countDocuments(sentEmailFilter),
            Lead.countDocuments(repliedLeadFilter),
            Lead.countDocuments(convertedLeadFilter),
            Lead.countDocuments({ ...leadScopeFilter, status: "new" }),
            Lead.countDocuments({ ...leadScopeFilter, status: "contacted" }),
            WorkflowRun.countDocuments({ ...workflowRunFilter, status: "running" }),
            WorkflowRun.countDocuments({ ...workflowRunFilter, status: "completed" }),
            WorkflowRun.countDocuments({ ...workflowRunFilter, status: "failed" }),
            Lead.aggregate([
                {
                    $match: averageScoreMatch
                },
                {
                    $group: {
                        _id: null,
                        avgLeadScore: { $avg: "$lead_score" }
                    }
                }
            ]),
            // Trend: leads today vs yesterday
            Lead.countDocuments({ createdAt: { $gte: todayStart } }),
            Lead.countDocuments({ createdAt: { $gte: yesterdayStart, $lt: todayStart } }),
            // Trend: emails today vs yesterday
            Message.countDocuments({
                channel: "email", status: "sent",
                $or: [{ direction: "outgoing" }, { direction: { $exists: false } }],
                sent_at: { $gte: todayStart }
            }),
            Message.countDocuments({
                channel: "email", status: "sent",
                $or: [{ direction: "outgoing" }, { direction: { $exists: false } }],
                sent_at: { $gte: yesterdayStart, $lt: todayStart }
            }),
            // Trend: replies today vs yesterday
            Lead.countDocuments({ status: "replied", last_replied_at: { $gte: todayStart } }),
            Lead.countDocuments({ status: "replied", last_replied_at: { $gte: yesterdayStart, $lt: todayStart } }),
            // Trend: conversions today vs yesterday
            Lead.countDocuments({ status: "converted", updatedAt: { $gte: todayStart } }),
            Lead.countDocuments({ status: "converted", updatedAt: { $gte: yesterdayStart, $lt: todayStart } }),
            WorkflowRun.find(workflowRunFilter)
                .select("_id lead_id status current_node filecoinCID started_at completed_at")
                .sort({ started_at: -1 })
                .limit(10)
                .lean()
        ]);

        const averageLeadScore = Number(averageScoreResult?.[0]?.avgLeadScore || 0);
        const averageLeadScorePct = Number((averageLeadScore * 100).toFixed(1));
        const responseRate = emailsSent > 0
            ? Number(((repliedLeads / emailsSent) * 100).toFixed(1))
            : 0;

        // Calculate trend percentages (today vs yesterday)
        const calcTrend = (today, yesterday) => {
            if (yesterday === 0 && today === 0) return { pct: 0, up: true };
            if (yesterday === 0) return { pct: 100, up: true };
            const pct = Math.round(((today - yesterday) / yesterday) * 100);
            return { pct, up: pct >= 0 };
        };

        const trends = {
            leads: calcTrend(leadsToday, leadsYesterday),
            emails: calcTrend(emailsToday, emailsYesterday),
            replies: calcTrend(repliesToday, repliesYesterday),
            conversions: calcTrend(conversionsToday, conversionsYesterday),
        };

        const analyticsData = {
            totalLeads,
            emailsSent,
            replies: repliedLeads,
            conversions: convertedLeads,
            responseRate,
            averageLeadScore,
            averageLeadScorePct,
            leadPipeline: {
                new: newLeads,
                contacted: contactedLeads,
                replied: repliedLeads,
                converted: convertedLeads
            },
            workflowRuns: {
                running: runningRuns,
                completed: completedRuns,
                failed: failedRuns,
                recentRuns: recentWorkflowRuns.map((run) => ({
                    id: run._id,
                    leadId: run.lead_id,
                    status: run.status,
                    currentNode: run.current_node,
                    startedAt: run.started_at,
                    completedAt: run.completed_at,
                    filecoinCID: run.filecoinCID || null
                }))
            },
            trends
        };

        // Index analytics snapshot into RAG
        indexAnalytics(analyticsData).catch(err =>
            console.error("RAG index failed for analytics:", err.message)
        );

        return res.status(200).json(analyticsData);
    } catch (error) {
        return next(error);
    }
};

/**
 * GET /api/analytics/chart-data
 * Returns daily leads created and emails engaged for the last 7 days.
 */
const getChartData = async (req, res, next) => {
    try {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);

        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        const [leadsPerDay, engagedPerDay] = await Promise.all([
            Lead.aggregate([
                { $match: { createdAt: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Message.aggregate([
                {
                    $match: {
                        sent_at: { $gte: sevenDaysAgo },
                        channel: "email",
                        status: "sent"
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$sent_at" }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        const leadsMap = {};
        for (const item of leadsPerDay) leadsMap[item._id] = item.count;

        const engagedMap = {};
        for (const item of engagedPerDay) engagedMap[item._id] = item.count;

        const chartData = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(sevenDaysAgo);
            d.setDate(d.getDate() + i);
            const key = d.toISOString().slice(0, 10);
            chartData.push({
                day: dayNames[d.getDay()],
                date: key,
                leads: leadsMap[key] || 0,
                engaged: engagedMap[key] || 0
            });
        }

        return res.status(200).json(chartData);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getCampaignAnalytics,
    getChartData
};
