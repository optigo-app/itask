import React from "react";
import ReusableTable from "./ReusableTable";

const challenges = [
    { id: 1, title: "Resource Allocation", description: "Difficulty in assigning the right resources to tasks efficiently." },
    { id: 2, title: "Time Management", description: "Delays due to unforeseen dependencies and scope creep." },
    { id: 3, title: "Communication Issues", description: "Lack of clear communication leading to misunderstandings." },
    { id: 4, title: "Technical Limitations", description: "Challenges with outdated or incompatible technologies." },
    { id: 5, title: "Budget Constraints", description: "Limited budget affecting project timelines and resources." },
    { id: 6, title: "Risk Management", description: "Identifying and mitigating project risks proactively." },
];

const TaskChallenges = () => {
    return (
        <ReusableTable
            className="reusable-table-container"
            columns={[
                { id: "id", label: "ID" },
                { id: "title", label: "Challenge" },
                { id: "description", label: "Description" }
            ]}
            data={challenges}
        />

    );
};

export default TaskChallenges;
