const express = require("express");
const app = express();
const cors = require('cors');
const axios = require("axios");
const { isEmpty } = require("lodash");
const { createHmac } = require("crypto");

app.use(cors());

const port = 3000;
const baseUrl = "https://dkyc-poc.digis.lk";

const getHeaders = (body, apiKey, key) => {
    const signature = createHmac("sha256", key).update(body).digest("hex");

    return {
        "Content-Type": "application/json",
        "API-KEY": apiKey,
        "HASH-SIGNATURE": signature,
    };
};

const requestHandler = async (req, res) => {
    try {
        if (isEmpty(req.headers["content-type"]))
            return res.send({ status: false, msg: "Content-Type Header is Missing" });

        if (isEmpty(req.headers["api-key"]))
            return res.send({ status: false, msg: "API-KEY Header is Missing" });

        if (isEmpty(req.headers["hash-signature"]))
            return res.send({
                status: false,
                msg: "HASH-SIGNATURE Header is Missing",
            });

        const body = JSON.stringify(req.body);

        const path = `${baseUrl}${req.originalUrl}`;

        const headers = getHeaders(
            body,
            req.headers["api-key"],
            req.headers["hash-signature"]
        );

        const response = await axios.post(path, body, { headers });

        return res.send(response.data);
    } catch (error) {
        console.log("error", error.message);
        return res.send({ status: false, msg: error.message });
    }
};

app.use((req, res, next) => {
    const message = `${req.method} --> ${req.originalUrl}`;

    console.log(message);

    next();
});

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello PlugNMeet!");
});

app.post(/(.*)/, requestHandler);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});