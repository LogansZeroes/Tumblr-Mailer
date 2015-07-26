var fs = require('fs');
var ejs = require('ejs');
var tumblr = require('tumblr.js')
var mandrill = require('mandrill-api/mandrill');

var mandrill_client = new mandrill.Mandrill('');

var csvFile = fs.readFileSync("friend_list1.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.ejs', 'utf8');

var client = tumblr.createClient({
  consumer_key: '',
  consumer_secret: '',
  token: '',
  token_secret: ''
});

function csvParse(csvFile){

	var array = [];
	var people = csvFile.split('\n');
	var keys = people.shift().split(',');

	people.forEach(function (person){

		person = person.split(',');
		var object = {}; 

		for (var i = 0; i < person.length; i++){
			object[keys[i]] = person[i];
		}
		array.push(object);
	})
	return array;
}

function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,    
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]    
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
    }, function(e) {
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
    });
 };

client.posts('technicallyfire.tumblr.com', function(err, blog){
	var todayDate = new Date();
	var todaySecs = todayDate.getTime()/1000;
	var timeFrameSecs = 7*24*60*60;
	var latestPosts = [];

  	blog.posts.forEach(function(post){
  		if( (todaySecs - post.timestamp) < timeFrameSecs){
  			latestPosts.push(post);
  		}
  	});

  	friendList = csvParse(csvFile);

	friendList.forEach(function(row){

		firstName = row["firstName"];
		numMonthsSinceContact = row["numMonthsSinceContact"];
		templateCopy = emailTemplate;

		var customizedTemplate = ejs.render(templateCopy, {
			firstName: firstName,
			numMonthsSinceContact: numMonthsSinceContact,
			latestPosts: latestPosts
		});

		sendEmail(firstName, row["emailAddress"], "Jimin Sung", "jiminsung27@gmail.com", "Learning Programming & Tumblr Blog", customizedTemplate);
	});
});