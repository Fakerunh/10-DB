const express = require('express')
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');
const { count } = require('console');
const app = express();

require('dotenv').config();

// Соединение с базой данных
const connection = mysql.createConnection({
    host: process.env.HOST,
    database: process.env.DATABASE,
    user: process.env.DB_USER,
    password: process.env.PASSWORD
});

connection.connect((err) => {
    if (err) {
        console.log(err);
    }
});

// Путь к директории файлов ресурсов (css, js, images)
app.use(express.static('public'));

// Настройка шаблонизатора
app.set('view engine', 'ejs');

// Путь к директории файлов отображения контента
app.set('views', path.join(__dirname, 'views'));

// Обработка POST-запросов из форм
app.use(express.urlencoded({ extended: true }));

// Инитиализацияя сессии
app.use(session({ secret:"Secret", resave: false, saveUninitialized:true }));

// Запуск веб-сервера по адресу http://localhost:3000
app.listen(3000);

function isAuth(req, res, next) {
    if(req.session.auth){
        next();
    } else{
        res.redirect("/");
    }
}

/**
 * Маршруты
 */
app.get('/', (req, res) => {
    const itemsPerPage=4;
    let page=parseInt(req.query.page);
    if(!page) page=1;

    connection.query("select count(id) as count from items", (err,data,fields)=>{
        const count =data[0].count;
        const pages =Math.ceil(count/itemsPerPage);

        if(page > pages) page=pages;
        
        connection.query("SELECT * FROM items LIMIT ? OFFSET ?", [[itemsPerPage], [(page - 1) * itemsPerPage]], (err, data, fields) => {
            if (err) {
                console.log(err);
            }
    
            res.render('home', {
                'items': data,
                'currentPage': page,
                'totalPages': pages,
            });
        });
    })
})

app.get('/items/:id', (req, res) => {
    connection.query("SELECT * FROM items WHERE id=?", [req.params.id],
        (err, data, fields) => {
            if (err) {
                console.log(err);
            }

            res.render('item', {
                'item': data[0],
            })
        });
})

app.get('/add', isAuth, (req, res) => {
    res.render('add')
})

app.post('/store', isAuth, (req, res) => {
    connection.query(
        "INSERT INTO items (title, image) VALUES (?, ?)",
        [[req.body.title], [req.body.image]],
        (err, data, fields) => {
            if (err) {
                console.log(err);
            }

            res.redirect('/');
        }
    );
})

app.post('/delete', (req, res) => {
    connection.query(
        "DELETE FROM items WHERE id=?", [[req.body.id]], (err, data, fields) => {
            if (err) {
                console.log(err);
            }
            res.redirect('/');
        }
    );
})

app.post('/update', (req, res) => {
    connection.query(
        "UPDATE items SET title=?, image=? WHERE id=?", [[req.body.title],[req.body.image],[req.body.id]], (err, data, fields) => {
            if (err) {
                console.log(err);
            }
            res.redirect('/');
        }
    );
})

app.get('/auth', (req,res) => {
    res.render('auth');

});

app.post('/authh', (req, res) => {
    connection.query(
        "SELECT * FROM users WHERE name=? and password=?",
        [[req.body.name], [req.body.password]],
        (err, data, fields) => {
            if (err) {
                console.log(err);
            }
            if (data.length > 0) {
                req.session.auth = true;
            } else {
                console.log('no auth');
            }
            res.redirect('/');
        }
    );
})