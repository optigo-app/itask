import React from "react";
import ReusableTable from "./ReusableTable";

const rndData = [
    { id: 1, topic: "New Material Research", description: "Exploring eco-friendly materials for production." },
    { id: 2, topic: "AI Integration", description: "Investigating AI-driven automation for manufacturing." },
    { id: 3, topic: "Market Trends", description: "Analyzing current market demands and trends." },
    { id: 4, topic: "Process Optimization", description: "Enhancing production efficiency with lean methodologies." },
    { id: 5, topic: "Prototype Testing", description: "Conducting tests on new product prototypes." },
    { id: 6, topic: "Software Innovations", description: "Developing new software for operational improvements." },
];

const RnDTask = () => {
    return (
        <ReusableTable
           className="reusable-table-container"
            columns={[
                { id: "id", label: "ID" },
                { id: "topic", label: "Research Topic" },
                { id: "description", label: "Description" }
            ]}
            data={rndData}
        />
    );
};

export default RnDTask;
