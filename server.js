const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());
app.use(express.json());

/* =========================
   DATABASE CONNECTION
========================= */

const db = mysql.createConnection({

  host: 'localhost',
  user: 'root',
  password: 'aachujuva1234A',
  database: 'leaveflow'

});

db.connect((err) => {

  if(err){

    console.log('❌ Database Connection Failed');
    console.log(err);

  }

  else{

    console.log('✅ MySQL Connected Successfully');

  }

});

/* =========================
   REGISTER USER
========================= */

app.post('/register', (req,res) => {

  const {
    full_name,
    email,
    password,
    role
  } = req.body;

  const sql =
  `
  INSERT INTO users
  (
    full_name,
    email,
    password,
    role
  )

  VALUES (?,?,?,?)
  `;

  db.query(
    sql,
    [
      full_name,
      email,
      password,
      role
    ],

    (err,result) => {

      if(err){

        console.log(err);

        return res.json({

          success:false,
          message:'Registration Failed'

        });

      }

      res.json({

        success:true,
        message:'Registration Successful'

      });

    }
  );

});

/* =========================
   LOGIN USER
========================= */

app.post('/login', (req,res) => {

  const {
    email,
    password,
    role
  } = req.body;

  const sql =
  `
  SELECT * FROM users
  WHERE email = ?
  AND password = ?
  AND role = ?
  `;

  db.query(
    sql,
    [
      email,
      password,
      role
    ],

    (err,result) => {

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
          user:result[0]

        });

      }

      else{

        res.json({

          success:false,
          message:'Invalid Email, Password or Role'

        });

      }

    }
  );

});

/* =========================
   APPLY LEAVE
========================= */

app.post('/apply-leave', (req,res) => {

  const {

    user_id,
    employee_name,
    leave_type,
    from_date,
    to_date,
    reason

  } = req.body;

  console.log(req.body);

  const sql =
  `
  INSERT INTO leaves
  (
    user_id,
    employee_name,
    leave_type,
    from_date,
    to_date,
    reason,
    status
  )

  VALUES (?,?,?,?,?,?,?)
  `;

  db.query(
    sql,
    [

      user_id,
      employee_name,
      leave_type,
      from_date,
      to_date,
      reason,
      'Pending'

    ],

    (err,result) => {

      if(err){

        console.log('❌ APPLY LEAVE ERROR');
        console.log(err);

        return res.json({

          success:false,
          message:'Failed To Apply Leave'

        });

      }

      res.json({

        success:true,
        message:'Leave Applied Successfully'

      });

    }
  );

});

/* =========================
   GET EMPLOYEE LEAVES
========================= */

app.get('/my-leaves/:id', (req,res) => {

  const userId =
    req.params.id;

  const sql =
  `
  SELECT * FROM leaves
  WHERE user_id = ?
  ORDER BY id DESC
  `;

  db.query(
    sql,
    [userId],

    (err,result) => {

      if(err){

        console.log(err);

        return res.json([]);

      }

      res.json(result);

    }
  );

});

/* =========================
   GET ALL LEAVES
========================= */

app.get('/all-leaves', (req,res) => {

  const sql =
  `
  SELECT * FROM leaves
  ORDER BY id DESC
  `;

  db.query(
    sql,

    (err,result) => {

      if(err){

        console.log(err);

        return res.json({

          success:false,
          leaves:[]

        });

      }

      res.json({

        success:true,
        leaves:result

      });

    }
  );

});

/* =========================
   APPROVE LEAVE
========================= */

app.put('/approve-leave/:id', (req,res) => {

  const leaveId =
    req.params.id;

  const sql =
  `
  UPDATE leaves
  SET status = 'Approved'
  WHERE id = ?
  `;

  db.query(
    sql,
    [leaveId],

    (err,result) => {

      if(err){

        console.log(err);

        return res.json({

          success:false,
          message:'Approval Failed'

        });

      }

      res.json({

        success:true,
        message:'Leave Approved Successfully'

      });

    }
  );

});

/* =========================
   REJECT LEAVE
========================= */

app.put('/reject-leave/:id', (req,res) => {

  const leaveId =
    req.params.id;

  const sql =
  `
  UPDATE leaves
  SET status = 'Rejected'
  WHERE id = ?
  `;

  db.query(
    sql,
    [leaveId],

    (err,result) => {

      if(err){

        console.log(err);

        return res.json({

          success:false,
          message:'Reject Failed'

        });

      }

      res.json({

        success:true,
        message:'Leave Rejected Successfully'

      });

    }
  );

});

/* =========================
   SERVER
========================= */

const PORT = 5000;

app.listen(PORT, () => {

  console.log(
    `🚀 Server running on port ${PORT}`
  );

});