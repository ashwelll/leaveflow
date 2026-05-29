const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());

app.use(bodyParser.json());

/* =========================
   DATABASE CONNECTION
========================= */

const db = mysql.createConnection({

    host: 'localhost',
    user: 'root',
    password: 'aachujuva1234A',
    database: 'leaveflow'

});

/* =========================
   CONNECT MYSQL
========================= */

db.connect((err) => {

    if(err){

        console.log('❌ Database Connection Failed');

        console.log(err);

    }

    else{

        console.log('✅ MySQL Connected');

    }

});

/* =========================
   REGISTER API
========================= */

app.post('/register', (req, res) => {

    const {

        full_name,
        email,
        role,
        password

    } = req.body;

    /* VALIDATION */

    if(
        !full_name ||
        !email ||
        !role ||
        !password
    ){

        return res.json({

            success:false,
            message:'All fields are required'

        });

    }

    /* CHECK EXISTING EMAIL */

    const checkSql =
    `
    SELECT * FROM users
    WHERE email = ?
    `;

    db.query(checkSql,[email],(err,result)=>{

        if(err){

            console.log(err);

            return res.json({

                success:false,
                message:'Database Error'

            });

        }

        if(result.length > 0){

            return res.json({

                success:false,
                message:'Email already registered'

            });

        }

        /* INSERT USER */

        const insertSql =
        `
        INSERT INTO users
        (
            full_name,
            email,
            role,
            password
        )

        VALUES (?,?,?,?)
        `;

        db.query(

            insertSql,

            [
                full_name,
                email,
                role,
                password
            ],

            (err,result)=>{

                if(err){

                    console.log(err);

                    res.json({

                        success:false,
                        message:'Registration Failed'

                    });

                }

                else{

                    res.json({

                        success:true,
                        message:'Registration Successful'

                    });

                }

            }

        );

    });

});

/* =========================
   LOGIN API
========================= */

app.post('/login',(req,res)=>{

    const {

        email,
        password,
        role

    } = req.body;

    if(
        !email ||
        !password ||
        !role
    ){

        return res.json({

            success:false,
            message:'Please fill all fields'

        });

    }

    const sql =
    `
    SELECT * FROM users
    WHERE email=? AND password=? AND role=?
    `;

    db.query(

        sql,

        [
            email,
            password,
            role
        ],

        (err,result)=>{

            if(err){

                console.log(err);

                return res.json({

                    success:false,
                    message:'Database Error'

                });

            }

            if(result.length > 0){

                res.json({

                    success:true,
                    message:'Login Successful',

                    role:result[0].role,

                    user:{

                        id:result[0].id,
                        full_name:result[0].full_name,
                        email:result[0].email,
                        role:result[0].role

                    }

                });

            }

            else{

                res.json({

                    success:false,
                    message:'Invalid Credentials'

                });

            }

        }

    );

});

/* =========================
   APPLY LEAVE API
========================= */

app.post('/apply-leave',(req,res)=>{

    const {

        user_id,
        leave_type,
        from_date,
        to_date,
        reason

    } = req.body;

    if(
        !user_id ||
        !leave_type ||
        !from_date ||
        !to_date ||
        !reason
    ){

        return res.json({

            success:false,
            message:'Please fill all fields'

        });

    }

    /* CHECK DATE */

    if(new Date(from_date) > new Date(to_date)){

        return res.json({

            success:false,
            message:'From date cannot be greater than To date'

        });

    }

    const sql =
    `
    INSERT INTO leave_requests
    (
        user_id,
        leave_type,
        from_date,
        to_date,
        reason,
        status,
        created_at
    )

    VALUES
    (
        ?,
        ?,
        ?,
        ?,
        ?,
        'Pending',
        NOW()
    )
    `;

    db.query(

        sql,

        [
            user_id,
            leave_type,
            from_date,
            to_date,
            reason
        ],

        (err,result)=>{

            if(err){

                console.log(err);

                res.json({

                    success:false,
                    message:'Failed To Apply Leave'

                });

            }

            else{

                res.json({

                    success:true,
                    message:'Leave Request Submitted Successfully'

                });

            }

        }

    );

});

/* =========================
   GET USER LEAVES
========================= */

app.get('/my-leaves/:id',(req,res)=>{

    const userId = req.params.id;

    const sql =
    `
    SELECT *

    FROM leave_requests

    WHERE user_id = ?

    ORDER BY id DESC
    `;

    db.query(sql,[userId],(err,result)=>{

        if(err){

            console.log(err);

            return res.json({

                success:false,
                message:'Error Fetching Leaves'

            });

        }

        res.json({

            success:true,
            leaves:result

        });

    });

});

/* =========================
   GET USER PROFILE
========================= */

app.get('/profile/:id',(req,res)=>{

    const userId = req.params.id;

    const sql =
    `
    SELECT
        id,
        full_name,
        email,
        role

    FROM users

    WHERE id = ?
    `;

    db.query(sql,[userId],(err,result)=>{

        if(err){

            console.log(err);

            return res.json({

                success:false,
                message:'Database Error'

            });

        }

        if(result.length === 0){

            return res.json({

                success:false,
                message:'User Not Found'

            });

        }

        res.json({

            success:true,
            user:result[0]

        });

    });

});

/* =========================
   UPDATE PROFILE
========================= */

app.put('/update-profile/:id',(req,res)=>{

    const userId = req.params.id;

    const {

        full_name,
        email

    } = req.body;

    const sql =
    `
    UPDATE users

    SET
        full_name = ?,
        email = ?

    WHERE id = ?
    `;

    db.query(

        sql,

        [
            full_name,
            email,
            userId
        ],

        (err,result)=>{

            if(err){

                console.log(err);

                return res.json({

                    success:false,
                    message:'Failed To Update Profile'

                });

            }

            res.json({

                success:true,
                message:'Profile Updated Successfully'

            });

        }

    );

});

/* =========================
   DELETE LEAVE REQUEST
========================= */

app.delete('/delete-leave/:id',(req,res)=>{

    const leaveId = req.params.id;

    const sql =
    `
    DELETE FROM leave_requests
    WHERE id = ?
    `;

    db.query(sql,[leaveId],(err,result)=>{

        if(err){

            console.log(err);

            return res.json({

                success:false,
                message:'Failed To Delete Leave'

            });

        }

        res.json({

            success:true,
            message:'Leave Deleted Successfully'

        });

    });

});

/* =========================
   DASHBOARD STATS
========================= */

app.get('/dashboard-stats/:id',(req,res)=>{

    const userId = req.params.id;

    const sql =
    `
    SELECT

    COUNT(*) AS total,

    SUM(
        CASE
        WHEN status='Approved'
        THEN 1
        ELSE 0
        END
    ) AS approved,

    SUM(
        CASE
        WHEN status='Pending'
        THEN 1
        ELSE 0
        END
    ) AS pending,

    SUM(
        CASE
        WHEN status='Rejected'
        THEN 1
        ELSE 0
        END
    ) AS rejected

    FROM leave_requests

    WHERE user_id = ?
    `;

    db.query(sql,[userId],(err,result)=>{

        if(err){

            console.log(err);

            return res.json({

                success:false,
                message:'Error Loading Stats'

            });

        }

        res.json({

            success:true,
            stats:{

                total:
                    result[0].total || 0,

                approved:
                    result[0].approved || 0,

                pending:
                    result[0].pending || 0,

                rejected:
                    result[0].rejected || 0

            }

        });

    });

});

/* =========================
   ADMIN - GET ALL LEAVES
========================= */

app.get('/all-leaves',(req,res)=>{

    const sql =
    `
    SELECT

        leave_requests.*,

        users.full_name,

        users.email

    FROM leave_requests

    JOIN users

    ON leave_requests.user_id = users.id

    ORDER BY leave_requests.id DESC
    `;

    db.query(sql,(err,result)=>{

        if(err){

            console.log(err);

            return res.json({

                success:false,
                message:'Error Fetching Leaves'

            });

        }

        res.json({

            success:true,
            leaves:result

        });

    });

});

/* =========================
   APPROVE LEAVE
========================= */

app.put('/approve-leave/:id',(req,res)=>{

    const leaveId = req.params.id;

    const sql =
    `
    UPDATE leave_requests

    SET status='Approved'

    WHERE id=?
    `;

    db.query(sql,[leaveId],(err,result)=>{

        if(err){

            console.log(err);

            return res.json({

                success:false,
                message:'Failed To Approve'

            });

        }

        res.json({

            success:true,
            message:'Leave Approved'

        });

    });

});

/* =========================
   REJECT LEAVE
========================= */

app.put('/reject-leave/:id',(req,res)=>{

    const leaveId = req.params.id;

    const sql =
    `
    UPDATE leave_requests

    SET status='Rejected'

    WHERE id=?
    `;

    db.query(sql,[leaveId],(err,result)=>{

        if(err){

            console.log(err);

            return res.json({

                success:false,
                message:'Failed To Reject'

            });

        }

        res.json({

            success:true,
            message:'Leave Rejected'

        });

    });

});

/* =========================
   ROOT API
========================= */

app.get('/',(req,res)=>{

    res.send('🚀 LeaveFlow HRMS Backend Running');

});

/* =========================
   SERVER
========================= */

app.listen(5000,()=>{

    console.log('🚀 Server running on port 5000');

});