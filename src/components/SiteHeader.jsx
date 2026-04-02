import React from "react";
import { Link } from "react-router-dom";

const SiteHeader = () => {
    return (
        <div style={{ position: "absolute", top: "8px", left: "12px" }}>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
                created by <Link to="/" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "underline", fontSize: "11px" }}>Jack Gilson</Link>
            </span>
        </div>
    );
};

export default SiteHeader;
