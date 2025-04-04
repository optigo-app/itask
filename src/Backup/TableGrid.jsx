import React, { useEffect, useState } from "react";
import "./TableGrid.css";

const useScale = () => {
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const updateScale = () => {
            const baseWidth = 1440; // your desktop design width
            const newScale = window.innerWidth / baseWidth;
            setScale(newScale < 1 ? newScale : 1); // Don't scale up
        };

        updateScale();
        window.addEventListener("resize", updateScale);
        return () => window.removeEventListener("resize", updateScale);
    }, []);

    return scale;
};

const TableGrid = () => {
    const scale = useScale();

    return (
        <div className="table-wrapper">
            <div
                className="table-container"
                style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
            >
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(10)].map((_, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>User {index + 1}</td>
                                <td>Development</td>
                                <td>{index % 2 === 0 ? "Active" : "Inactive"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TableGrid;
