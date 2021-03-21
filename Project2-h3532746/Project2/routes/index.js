var express = require('express');
var router = express.Router();
var db = require('mongoose');
/* GET login page. */

router.get('/', function(req, res, next) {
  res.redirect('/index.html');
});

router.get('/index.html', function(req, res, next) {
  if(req.session.login){
    res.redirect('/main.html');
  }else{
    res.render('index');
  }
});

router.get('/createaccount.html', function(req, res, next) {
  res.render('createaccount');
});

//create ac
router.post('/create', function(req, res) {
  req.login.find({userid: req.body.username}, function(err, result){
    if (err)
      console.log(err);
  	else if(result.length>0){
      console.log(result);
      res.render('create', {message:'Account already existed'});
    }else{
      var addUser = new req.login({
        _id: new db.Types.ObjectId,
        userid: req.body.username,
        pw: req.body.password
      });
      addUser.save(function (err, result) {
        if(err){
          console.log(err);
        }else if(!err){
          res.render('create', {message:'Account created! Welcome'});
        }
      });
    }
  });
});

//login ac
router.post('/verifyLogin', function(req, res) {
  req.login.find({userid: req.body.username}, function(err, result){
    if (err)
      console.log(err);
  	else if((result.length > 0) && (req.body.password === result[0].pw)){
      req.session.login = req.body.username;
      res.redirect('/main.html');
    }else{
      res.render('verifyLogin', {message:'Invalid login, please login again'});
    }
  })
});

//main
router.get('/main.html', function(req, res, next) {
  if(req.session.login){
    res.render('main');
  }else{
    res.render('verifyLogin', {message:'You have not logged in'});
  }
});

//buywelcome
router.get('/buywelcome', function(req, res, next) {
  if(req.session.login){
    req.broadcast.find(function(err, result1){
      req.film.find(function(err, result2){
        res.render('buywelcome', {broadcasts: result1, films: result2});
      });
    });
  }else{
    res.render('verifyLogin', {message:'You have not logged in'});
  }
});

//seatplantry
router.get('/seatplantry', function(req, res, next){
  if(req.session.login){
    //res.render('seatplantry', {broadcast: result});
    console.log(req.query.broadcast);
    req.broadcast.find({broadcastid: req.query.broadcast}, function(err, result1){
      if(err){
        console.log(err);
      }else{
        console.log(result1);
        req.film.find({filmid: result1[0].filmid}, function(err, result2){
          if(err){
            console.log(err);
          }else{
            req.ticket.find(function(err, result3){
              if(err){
                console.log(err);
              }else{
                var tfbc=[];
                for(var i = 0; i < result3.length; i++){
                  if(result3[i].broadcastid==req.query.broadcast){
                    tfbc.push(result3[i]);
                  }
                }
                console.log(tfbc);
                console.log(result2[0].filmname);
                res.render('seatplantry', {broadcast: result1[0], film: result2[0], ticket: tfbc});
              }
            });
          }
        });
      }
    });
  }else{
    res.render('verifyLogin', {message:'You have not logged in'});
  }
});

//buyticket
router.get('/buyticket', function(req, res, next){
  if(req.session.login){
    if(!req.query.seatnum){
      res.redirect('/buywelcome');
    }else{
      req.broadcast.find({broadcastid: req.query.broadcast}, function(err, result1){
        req.film.find({filmid: result1[0].filmid}, function(err, result2){
          console.log(result1[0]);
          console.log(req.query.seatnum);
          res.render('buyticket', {broadcast: result1[0], seatnum: req.query.seatnum, film: result2[0]});
        });
      });
    }
  }else{
    res.render('verifyLogin', {message:'You have not logged in'});
  }
});

//confirm
router.get('/confirm', function(req, res, next){
  if(req.session.login){
    console.log(req.query);
    req.ticket.find(function(err, result){
      var id = result.length;
      for(var x = 0; x < req.query.item*2; x=x+2){
        var newticket = [];
        var seatno = req.query.price[x];
        var fee = req.query.price[x+1];
        var type;
        if(fee=='Adult($75)'){
          type='Adult';
          fee=75;
        }else{
          type='Student/Senior';
          fee=50;
        }
        newticket.push({
          userid: req.session.login,
          ticketid: id,
          broadcastid: req.query.broadcast,
          seatno: seatno,
          tickettype: type,
          ticketfee: fee
        });
        req.ticket.collection.insert(newticket, function (err, docs) {
          if (err){ 
              return console.error(err);
          } else {
            console.log("Inserted!!!");
          }
        });
        id = id + 1;
      }
      console.log(newticket);
      req.broadcast.find({broadcastid: req.query.broadcast}, function(err, result1){
        req.film.find({filmid: result1[0].filmid}, function(err, result2){
          res.render('confirm', {price:req.query.price, item:req.query.item, broadcast:result1[0], film:result2[0]});
        });
      });
    });
  }else{
    res.render('verifyLogin', {message:'You have not logged in'});
  }
});

//comment
router.get('/comment', function(req, res, next){
  if(req.session.login){
    req.film.find(function(err, reuslt1) {
      if (err) console.log(err);
      req.comment.find(function(err, result2) {
        if (!err){
          res.render('comment', {films: reuslt1, comments: result2});
        }
        else {
          res.send({msg: err });
        }
        });
    });
  }else{
    res.render('verifyLogin', {message:'You have not logged in'});
  }
});

//comment_submit
router.post('/comment_submit', function(req, res, next){
  if(req.session.login){
    req.comment.find(function(err, result){
      var comment = {
        commentid: result.length+1,
        filmid: req.body.cmfilm,
        userid: req.session.login,
        comment: req.body.cm
      }
      req.comment.collection.insert(comment, function(){
        if (err){ 
          return console.error(err);
        } else {
          console.log("Inserted!!!");
          res.render('comment_submit', {message: 'Your comment has been submitted.'});
        }
      })
    });
  }else{
    res.render('verifyLogin', {message:'You have not logged in'});
  }
});

//comment_retrieve
router.get('/comment_retrieve', function(req, res, next){
  if(req.session.login){
    var fid = parseInt(req.query.fid);
    req.comment.find(function(err, result){
      var cm = [];
      for(var i = 0; i < result.length; i++){
        if(result[i].filmid==req.query.fid){
          cm.push(result[i]);
        }
      }
      // console.log(req.query.fid);
      // console.log(cm);
      res.render('comment_retrieve', {comments: cm});
    });
  }else{
    res.render('verifyLogin', {message:'You have not logged in'});
  }
});

//histroy
router.get('/history', function(req, res, next){
  if(req.session.login){
    req.ticket.find({userid: req.session.login}, function(err, result1){
        req.broadcast.find(function(err, result2){
          req.film.find(function(err, result3){
            console.log(req.session.login);
            console.log(result1);
            console.log(result2);
            console.log(result3);
            res.render('history', {user: req.session.login, tickets: result1, broadcasts: result2, films: result3});
          });
        });
    });
  }else{
    res.render('verifyLogin', {message:'You have not logged in'});
  }
});

//logout
router.get('/logout', function(req, res, next){
  if(req.session.login){
    req.session.destroy();
    res.redirect('/index.html');
  }else{
    res.render('verifyLogin', {message:'You have not logged in'});
  }
});

//load data
router.get('/load', function(req, res, next){
  // var bro = [{
  //   broadcastid: 1,
  //   filmid: 1,
  // 	date: '16/11/2015',
  // 	time: '12:10',
  //   houseid: 'A',
  //   houserow: 5,
  //   housecol: 5,
  // 	day: 'Mon'
  // },{
  //   broadcastid: 2,
  //   filmid: 1,
  // 	date: '16/11/2015',
  // 	time: '13:10',
  //   houseid: 'C',
  //   houserow: 4,
  //   housecol: 7,
  //   day: 'Mon'
  // },{
  //   broadcastid: 3,
  //   filmid: 2,
  // 	date: '16/11/2015',
  // 	time: '12:50',
  //   houseid: 'A',
  //   houserow: 5,
  //   housecol: 5,
  // 	day: 'Mon'
  // },{
  //   broadcastid: 4,
  //   filmid: 2,
  // 	date: '16/11/2015',
  // 	time: '13:20',
  //   houseid: 'B',
  //   houserow: 6,
  //   housecol: 4,
  // 	day: 'Mon'
  // },{
  //   broadcastid: 5,
  //   filmid: 3,
  // 	date: '16/11/2015',
  // 	time: '15:20',
  //   houseid: 'A',
  //   houserow: 5,
  //   housecol: 5,
  // 	day: 'Mon'
  // },{
  //   broadcastid: 6,
  //   filmid: 4,
  // 	date: '16/11/2015',
  // 	time: '16:20',
  //   houseid: 'A',
  //   houserow: 5,
  //   housecol: 5,
  // 	day: 'Mon',
  // }]
  // req.broadcast.collection.insert(bro, function (err, docs) {
  //   if (err){ 
  //       return console.error(err);
  //   } else {
  //     console.log("Inserted!!!");
  //     res.redirect('/index.html');
  //   }
  // });
  // req.broadcast.
  // findOne({ date: '16/11/2015' }).
  // populate('house').
  // exec(function (err, doc) {
  //   if (err) return handleError(err);
  //   console.log('House is %s', doc.house.houseid);
  //   res.redirect('/index.html');
  // });
  // var fil = [{
  //   filmid: 1,
  //   filmname: 'Return Of The Cuckoo',
  //   duration: '103 mins',
  //   category: 'IIA',
  //   language: 'Cantonese',
  //   director: 'Patrick Kong',
  //   description: 'During the day of the handover of Macau in 1999, Man-Cho (Chi Lam Cheung), Kiki (Joe Chen) and a group of neighbors were celebrating with Aunty Q (Nancy Sit) for her birthday. Kwan-Ho migrates to US for...',
  // },
  // {
  //   filmid: 2,
  //   filmname: 'Suffragette',
  //   duration: '106 mins',
  //   category: 'IIA',
  //   language: 'English',
  //   director: 'Sarah Gavron',
  //   description: 'The foot soldiers of the early feminist movement, women who were forced underground to pursue a dangerous game of cat and mouse with an increasingly brutal State...',
  // },
  // {
  //   filmid: 3,
  //   filmname: 'She Remembers, He Forgets',
  //   duration: '110 mins',
  //   category: 'IIA',
  //   language: 'Cantonese',
  //   director: 'Adam Wong',
  //   description: 'Unfulfilled at work and dissatisfied with her marital life, a middle-aged woman attends a high school reunion and finds a floodgate of flashbacks of her salad days open before her mind eyes...',
  // },
  // {
  //   filmid: 4,
  //   filmname: 'Spectre',
  //   duration: '148 mins',
  //   category: 'IIB',
  //   language: 'English',
  //   director: 'Sam Mendes',
  //   description: 'Unfulfilled at work and dissatisfied with her marital life, a middle-aged woman attends a high school reunion and finds a floodgate of flashbacks of her salad days open before her mind eyes...',
  // }]
  // req.film.collection.insert(fil, function (err, docs) {
  //   if (err){ 
  //       return console.error(err);
  //   } else {
  //     console.log("Inserted!!!");
  //     res.redirect('/index.html');
  //   }
  // });
});


module.exports = router;
