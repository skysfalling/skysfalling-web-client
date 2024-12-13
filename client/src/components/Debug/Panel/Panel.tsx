import React from "react";
import "./Panel.styles.css";

interface PanelProps {
    messages: string[];
}

export default function Panel({ messages }: PanelProps) {
    return (
        <div className="debug-panel">
            <h6>Debug Info Panel</h6>
            <div className="debug-info">
                {messages.map((message, index) => <p key={index}>{message}</p>)}
            </div>
        </div>
    );
}
