export const mockDashboardData = {
  metrics: [
    { label: 'Total Leads', value: '2,483', change: '+12.5%', trend: 'up' },
    { label: 'Campaigns Active', value: '8', change: '+2', trend: 'up' },
    { label: 'Engagement Rate', value: '34.2%', change: '+5.3%', trend: 'up' },
    { label: 'Avg Response Time', value: '2.4h', change: '-18%', trend: 'down' },
  ],
  recentCampaigns: [
    {
      id: 1,
      name: 'Q1 Tech Leads Outreach',
      status: 'active',
      leads: 342,
      engaged: 128,
      rate: '37.4%',
    },
    {
      id: 2,
      name: 'Enterprise Follow-up',
      status: 'paused',
      leads: 156,
      engaged: 89,
      rate: '57.1%',
    },
    {
      id: 3,
      name: 'Startup Accelerator',
      status: 'active',
      leads: 287,
      engaged: 92,
      rate: '32.1%',
    },
    {
      id: 4,
      name: 'Cold Email Campaign',
      status: 'completed',
      leads: 512,
      engaged: 198,
      rate: '38.7%',
    },
  ],
  chartData: [
    { day: 'Mon', leads: 24, engaged: 8 },
    { day: 'Tue', leads: 32, engaged: 12 },
    { day: 'Wed', leads: 45, engaged: 18 },
    { day: 'Thu', leads: 38, engaged: 14 },
    { day: 'Fri', leads: 52, engaged: 22 },
    { day: 'Sat', leads: 28, engaged: 9 },
    { day: 'Sun', leads: 18, engaged: 6 },
  ],
};

export const mockWorkflows = [
  {
    id: 1,
    name: 'Email Sequence',
    nodes: [
      { id: 'start', label: 'Start', type: 'trigger' },
      { id: 'send', label: 'Send Email', type: 'action' },
      { id: 'wait', label: 'Wait 3 Days', type: 'action' },
      { id: 'condition', label: 'If Opened?', type: 'decision' },
      { id: 'end', label: 'End', type: 'trigger' },
    ],
  },
];

export const mockLeads = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john@techcorp.com',
    company: 'TechCorp',
    status: 'new',
    added: '2 hours ago',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@innovate.io',
    company: 'Innovate Inc',
    status: 'engaged',
    added: '1 day ago',
  },
  {
    id: 3,
    name: 'Michael Chen',
    email: 'mchen@dataflow.com',
    company: 'DataFlow',
    status: 'contacted',
    added: '3 days ago',
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily@cloudbase.net',
    company: 'CloudBase',
    status: 'interested',
    added: '5 days ago',
  },
];

export const mockCampaigns = [
  {
    id: 1,
    name: 'Q1 Enterprise Outreach',
    status: 'active',
    leads: 156,
    sent: 142,
    opened: 78,
    rate: '54.9%',
    created: '2024-01-15',
  },
  {
    id: 2,
    name: 'Tech Startup Leads',
    status: 'active',
    leads: 89,
    sent: 87,
    opened: 34,
    rate: '39.1%',
    created: '2024-01-18',
  },
  {
    id: 3,
    name: 'Vertical Market Test',
    status: 'completed',
    leads: 234,
    sent: 234,
    opened: 156,
    rate: '66.7%',
    created: '2024-01-10',
  },
];

export const mockAiMessages = [
  {
    id: 1,
    template: 'Introduction Email',
    subject: 'Quick Question About Your {company}',
    body: 'Hi {name}, I noticed {company} is doing great work in {industry}. I thought you might find value in...',
    generated: true,
  },
  {
    id: 2,
    template: 'Follow-up Message',
    subject: 'Following up on my last email',
    body: 'Hi {name}, I wanted to circle back on the message I sent last week...',
    generated: false,
  },
];

export const mockSettings = {
  profile: {
    name: 'Your Company',
    email: 'admin@outreachai.com',
    timezone: 'EST',
    language: 'English',
  },
  api: {
    apiKey: 'sk-***************************',
    lastReset: '2024-01-01',
  },
  notifications: {
    emailNotifications: true,
    campaignUpdates: true,
    weeklyDigest: true,
  },
};
