import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import WorkflowViz from '../components/WorkflowViz';
import DashboardPreview from '../components/DashboardPreview';
import AutomationFlow from '../components/AutomationFlow';
import Trust from '../components/Trust';
import CTA from '../components/CTA';
import Navbar from '../components/Navbar';

function Landing() {
    return (
        <>
            <Navbar />
            <main>
                <Hero />
                <Features />
                <WorkflowViz />
                <DashboardPreview />
                <AutomationFlow />
                <Trust />
                <CTA />
            </main>
        </>
    );
}

export default Landing;
