import cron from "node-cron";

export default class {
    static async registerJob(client, jobs = []) {
        for (const job of jobs)
            await cron.schedule(job.expression,  async () => await job.action(client));
    }
}