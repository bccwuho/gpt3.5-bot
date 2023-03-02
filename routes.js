//SPDX-License-Identifier: Apache-2.0

let express = require('express');
let router = express.Router();
let controller = require('./controller.js');
let format = require('date-format');

module.exports = router;

router.use(function(req, res, next) {

  console.log(format.asString('hh:mm:ss.SSS', new Date())+'::............ '+req.url+' .............');
  next(); // make sure we go to the next routes and don't stop here

  function afterResponse() {
      res.removeListener('finish', afterResponse);          
  }    
  res.on('finish', afterResponse);

});

// production env routes
router.get("/", function (_req, res) {
	res.redirect("/index.html");
});

// dev env routes
router.post('/save',            controller.save);
router.post('/restore',         controller.restore);
router.post('/convert',         controller.convert);


router.get('/getAll',           controller.getAll);

router.post('/submitSystem',      controller.submitSystem);
router.post('/submitPrompt',      controller.submitPrompt);

