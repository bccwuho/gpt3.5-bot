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
router.post('/addSummary',      controller.addSummary);
router.post('/updateSummary',   controller.updateSummary);
router.post('/addDetails',      controller.addDetails);
router.post('/updateDetails',   controller.updateDetails);
router.post('/save',            controller.save);
router.post('/restore',         controller.restore);
router.post('/convert',         controller.convert);
router.post('/upload',          controller.upload);

router.get('/getAll',           controller.getAll);
