import  express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import connectToDatabase from './config/database';
import dotenv from "dotenv";
import router from './routes/auth.routes';

dotenv.config({
    path: ['.env.local'], quiet: true
});

const app = express();
connectToDatabase();
app.use(helmet());
app.use(cors());
app.use((req, res, next) => {
  if (
    req.headers['content-type']?.includes('application/json') &&
    ['POST', 'PUT', 'PATCH'].includes(req.method)
  ) {
    express.json()(req, res, next);
  } else {
    next();
  }
});
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', router);
// app.use('/api/employees', require('./routes/employee.routes'));
// app.use('/api/attendance', require('./routes/attendance.routes'));
// app.use('/api/leave', require('./routes/leave.routes'));
// app.use('/api/payroll', require('./routes/payroll.routes'));
// app.use('/api/documents', require('./routes/document.routes'));
// app.use('/api/notifications', require('./routes/notification.routes'));
// app.use('/api/reports', require('./routes/report.routes'));

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

export default app;