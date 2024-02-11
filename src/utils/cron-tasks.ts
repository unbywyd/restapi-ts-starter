import { CronJob } from 'cron'
import AuthService from './../api/auth/auth.service';

interface Services {
	authService: AuthService;
}

export default ({ authService }: Services) => {

	const job = new CronJob(
		'*/15 * * * * *',
		() => {
			const currentDate = new Date();
			console.log('Cron job 3', currentDate);
		},
		null,
		true,
		'Asia/Jerusalem'
	)

	job.start()
}
