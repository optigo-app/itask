import React from "react";
import { Card, CardContent, Typography, Link } from "@mui/material";
import "./InfoCard.scss";

const data = [
  {
    title: "Tstore",
    url: "http://apptstore.optigoapps.com",
    backendId: "Backend123",
    websiteId: "Website456",
    password: "securePwd1",
  },
  {
    title: "ShopNow",
    url: "http://shopnow.example.com",
    backendId: "Backend789",
    websiteId: "Website321",
    password: "securePwd2",
  },
];

const InfoCard = () => {
  return (
    <div className="card-container">
      {data.map((item, index) => (
        <Card key={index} className="info-card">
          <CardContent>
            <Typography variant="h6" className="title">
              {item.title}
            </Typography>
            <Link href={item.url} target="_blank" rel="noopener noreferrer">
              {item.url}
            </Link>
            <div className="info">
              <div>
                <strong>Backend ID:</strong> <span>{item.backendId}</span>
              </div>
              <div>
                <strong>Website ID:</strong> <span>{item.websiteId}</span>
              </div>
              <div>
                <strong>Password:</strong>{" "}
                <span className="password">{item.password}</span>
              </div>
            </div>
          </CardContent>
          <div className="footer">For testing purpose</div>
        </Card>
      ))}
    </div>
  );
};

export default InfoCard;
