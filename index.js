import express from 'express'; // 默认导入 Express
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import connToDb from './db.js';
import { reg,apiVEamil,login,loginAuth } from './auth.js'
import morgan from 'morgan';
import { userInfo} from './users.js'

const app = express();


const db = await connToDb();

// 配置速率限制器
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 分钟
    max: 50, // 每个 IP 每 15 分钟最多 100 次请求
    message: {
        error: "Too many requests, please try again later.",
        code: 429,
    },
    trustProxy: process.env.NODE_ENV === 'production',
});

// 启用 Trust Proxy
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', true);
} else {
    app.set('trust proxy', false);
}

// 将速率限制器应用于所有请求
app.use(limiter);
app.use(morgan('dev'));
app.use(
    session({
        secret: 'your-32132131321fdsdsefs3rwew-key', // 用于签名 Session ID 的密钥
        resave: false, // 不强制保存 Session
        saveUninitialized: false, // 只有在修改内容后才存储 Session
        cookie: {
            maxAge: 60000*30, // Session 有效期，单位毫秒（1分钟）
        },
    })
);
// 中间件解析 JSON 数据
app.use(express.json());

// 中间件解析 URL 编码数据
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    res.status(200)
    res.send('Hello, World!');
});

app.post('/api/reg/', reg(db))

app.get('/api/email/v/:token/', apiVEamil(db))

app.post('/api/login/', login(db))

app.get('/api/user/info/', loginAuth(db),userInfo(db))

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
