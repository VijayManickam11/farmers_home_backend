const job = require("../controllers/job");
const session = require("../lib/session");
const { Router } = require("express");

const app = Router();

app.post("/job", session.isSessionAuthenticated, job.createJob);
app.get("/job", session.isSessionAuthenticated, job.getJobs);
app.get("/job/:job_uid", session.isSessionAuthenticated, job.getJobDetails);
app.delete("/job/:job_uid", session.isSessionAuthenticated, job.deleteJob);
app.put("/job/:job_uid", session.isSessionAuthenticated, job.updateJob);
app.get("/job/:job_uid/matches", session.isSessionAuthenticated, job.getMatchingJobSeekers);
app.post("/job/:job_uid/matches", session.isSessionAuthenticated, job.refreshMatchingJobSeekers);

module.exports = app;