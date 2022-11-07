var express = require('express');
var app = express();
var fs = require("fs");
const axios = require('axios');
const cors = require('cors');

app.use(cors());


app.get('/listReservations', function (req, res) {
   fs.readFile( __dirname + "/" + "reservations.json", 'utf8', function (err, data) {
      console.log( data );
      res.end( data );
   });
})

var yelpToekn = 'jaPw2DAg0cNLSrZ-T1-H_Grj1iMtF8hTMyok7MBMH1m3MF2RVMJMHPikBjMb3aTtz1B7IsM0BX_-ZMPdf-fgrsp-R3FkBhd-BMyS_B5IE0hmRKBNt76H_ZgbQeItY3Yx';


app.get('/addReservation', function (req, res) {
   	
	try {
		let id = req.query.id;
		let name = req.query.name;
		let date = req.query.date;
		let time = req.query.time;
		let email = req.query.email;

		let resObject = getReservations();
						
		//let jsonData = JSON.parse(body);
		
		resObject[id] = {
		   "name":name,
		   "email":email,
		   "date":date,
		   "time":time
		 };
		
		console.log("reservation : ",  resObject);

		//save the modified object
		setReservations(resObject);

		res.status(201).send({
				message: "Reservation created!"
		   })
	 } catch (error) {
		res.status(500).send({
			code: error.code,
			message: error.message
		})
	}
	
})

app.get('/reservationExists/:id', function (req, res) {
   try {	   			
		let reservationObject = getReservations();

		let ReservationToDel = req.params.id;

		console.log('param - ', ReservationToDel);

		const hasKey = ReservationToDel in reservationObject;

		console.log('present in json - ', hasKey);

		if(!hasKey){
			res.status(201).send({
				message: "Registration not found!"
		   })
		   return;
		}else{
			res.status(201).send({
				message: "Registration found!"
		   })
		}
		
	 } catch (error) {
		res.status(500).send({
			code: error.code,
			message: error.message
		})
	}	
})

app.delete('/deleteRegistration/:id', function (req, res) {
		try {
			
			let reservationObject = getReservations();
			
			let ReservationToDel = req.params.id;
			
			console.log('param - ', ReservationToDel);
			
			const hasKey = ReservationToDel in reservationObject;
			
			console.log('present in json - ', hasKey);
			
			if(!hasKey){
				res.status(201).send({
					message: "Registration not found!"
			   })
			   return;
			}
			
			console.log('present in json. continuing');
			
			delete reservationObject[ReservationToDel];
			
			//save the modified object
			setReservations(reservationObject);

			res.status(201).send({
					message: "Reservation deleted!"
			   })
		 } catch (error) {
			res.status(500).send({
				code: error.code,
				message: error.message
			})
        }	
})



var server = app.listen(8084, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})

const getReservations = () => {
    let reservations = fs.readFileSync(__dirname + "\\" + 'reservations.json');
    return JSON.parse(reservations);
};

const setReservations = (reservations) => {
    let newReservationsObject = JSON.stringify(reservations, null, 2);
    fs.writeFileSync(__dirname + "\\" + 'reservations.json', newReservationsObject);
};


app.get('/autocomplete', function (req, res) {
   let data = req.query.text;
   if(data == ''){
		return;
   }	   
   let url = "https://api.yelp.com/v3/autocomplete?text=" + data;
   axios.get(url, { headers: {"Authorization" : `Bearer ${yelpToekn}`} }).then(response => {	  
		console.log(data, ' response sent');
		res.end(JSON.stringify(response.data));
	}).
	catch(err => console.log(err));
})


var googleApiKey = 'AIzaSyDDNosCCMiIbkGMxLXiL_3_puyG6tUDWUU';
var address = 'University+of+Southern+California+CA';

app.get('/search',async function (req, res) {
	try{
	
		let keyword = req.query.keyword;
		let distance = req.query.distance;
		let category = req.query.categories;
		let location = req.query.location;
		let lat = req.query.latitude;
		let lng = req.query.longitude;

		let url = 'https://api.yelp.com/v3/businesses/search?'

		url += 'keyword=' + keyword + '&distance=' +distance;

		console.log(location);
		
		if(location != undefined){
			//GoogleGeoCoding api
			await getLocationCordinates(location).then(res => {
				lat = JSON.parse(res)[0].geometry.location.lat;
				lng = JSON.parse(res)[0].geometry.location.lng;
				
			})		
		}
	   //else{
		 //  url += '&location=' + location;
	   //}
		url += '&latitude=' + lat;
		url += '&longitude=' + lng;
		console.log('lat - ' + lat + '  lng - ' + lng);

		//if(category != undefined){
			url += '&categories=' + category;
		//}
	   
	   console.log(url);
      
	   axios.get(url, { headers: {"Authorization" : `Bearer ${yelpToekn}`} }).then(response => {	  
			//console.log(JSON.stringify(response.data), ' response sent');
			res.end(JSON.stringify(response.data));
		}).
		catch(err => {
			console.log(err);
				res.status(500).send({
				code: err.code,
				message: err.message
			})
			//s.end({ message: err.message });
			//next(err);
		});
	} catch(err){
		res.status(500).send({
			code: err.code,
			message: err.message
		})
	}     
})

app.get('/getBusinessDetails/:id', function (req, res) {
   let data = req.params.id;
   if(data == ''){
		return;
   }	   
   let url = "https://api.yelp.com/v3/businesses/" + data;
   axios.get(url, { headers: {"Authorization" : `Bearer ${yelpToekn}`} }).then(response => {	  
		console.log(data, ' details sent');
		res.end(JSON.stringify(response.data));
	}).
	catch(err => console.log(err));
})

app.get('/getBusinessDetails/:id/reviews', function (req, res) {
   let data = req.params.id;
   if(data == ''){
		return;
   }	   
   let url = "https://api.yelp.com/v3/businesses/" + data + "/reviews";
   axios.get(url, { headers: {"Authorization" : `Bearer ${yelpToekn}`} }).then(response => {	  
		console.log(data, ' reviews sent');
		res.end(JSON.stringify(response.data.reviews));
	}).
	catch(err => console.log(err));
})

async function getLocationCordinates(location) {
    try {
		let locationUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + location + '&key=' + googleApiKey;
		
       let res = await axios({
            url: locationUrl,
            method: 'get',
            timeout: 8000,            
        })
        if(res.status == 200){
            // test for status you want, etc
            //console.log('Location get SUCCESS. ', res.status)
        } 
		//console.log(JSON.stringify(res.data.results))
        return JSON.stringify(res.data.results);
    }
    catch (err) {
        console.error(err);
    }
}






