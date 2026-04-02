import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div className="flexColumn alignCenter justifyCenter" style={{ minHeight: "100vh", padding: "24px" }}>
            <h1 className="whiteFont" style={{ fontSize: "36px", marginBottom: "48px" }}>World of Jack Gilson</h1>
            <div className="flexRow" style={{ gap: "24px" }}>
                <Link to="/gilsonGolfPools" style={{ textDecoration: "none" }}>
                    <div className="flexColumn alignCenter justifyCenter" style={{
                        border: "1px solid rgba(255,255,255,0.3)",
                        borderRadius: "12px",
                        padding: "32px 48px",
                        cursor: "pointer",
                        boxShadow: "0 1px 8px -2px rgba(255,255,255,0.3)"
                    }}>
                        <h2 className="whiteFont" style={{ marginBottom: "8px" }}>Golf Pools</h2>
                        <p className="whiteFont" style={{ opacity: 0.7 }}>PGA Tour fantasy golf pools</p>
                    </div>
                </Link>
                <a href="/gilsonGolfStats" style={{ textDecoration: "none" }}>
                    <div className="flexColumn alignCenter justifyCenter" style={{
                        border: "1px solid rgba(255,255,255,0.3)",
                        borderRadius: "12px",
                        padding: "32px 48px",
                        cursor: "pointer",
                        boxShadow: "0 1px 8px -2px rgba(255,255,255,0.3)"
                    }}>
                        <h2 className="whiteFont" style={{ marginBottom: "8px" }}>Golf Stats</h2>
                        <p className="whiteFont" style={{ opacity: 0.7 }}>Personal golf round tracking</p>
                    </div>
                </a>
            </div>
        </div>
    );
};

export default Home;
