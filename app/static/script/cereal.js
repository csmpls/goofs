// Full list of configuration options available here:
// https://github.com/hakimel/reveal.js#configuration
Reveal.initialize({
controls: false,
progress: true,
history: false,
center: true,
//autoSlide: 5000,
keyboard: true,
//loop: true,

theme: Reveal.getQueryHash().theme || 'serif', // available themes are in /css/theme
transition: Reveal.getQueryHash().transition || 'linear', // default/cube/page/concave/zoom/linear/fade/none
});

// set keyboard shortcuts
KeyboardJS.on('q', function() { note('q'); interestedIn(Reveal.getCurrentSlide()) }, null)
KeyboardJS.on('e', function() { note('e'); skip(Reveal.getCurrentSlide()) }, null)
KeyboardJS.on('up', function() { note('up') }, null)
KeyboardJS.on('down', function() { note('down') }, null)
KeyboardJS.on('left', function() { note('left') }, null)
KeyboardJS.on('right', function() { note('right'); checkIfEndOfFeed() }, null)

// embed previews of posts
embedPreviews();

// we open this queue after user is down browsing
var read_queue = []

// when we first express interest, we go to article preview
// if we express interest from article preview, we queue and go to the next slide
function interestedIn(slide) {

	// check if we're done
	checkIfEndOfFeed()

	var main_slide = getAndGoToMainSlide(slide)

	queue(main_slide)

	// wait 300ms, then go right
	setTimeout(Reveal.right, 300);


}

function skip(slide) {

	// check if we're done
	checkIfEndOfFeed()

	var main_slide = getAndGoToMainSlide(slide)	

	// deque the slide if the user was interested in it before
	if (hasInterestMarker(main_slide)) {

		// we keep post url in id of <section> tag
		var url = main_slide.attr('id') 

		// use url to lookup post
		for (var i=0;i<read_queue.length;i++) {
			if (read_queue[i]['url'] === url) {
				// remove the post from the queue
				remove(read_queue,read_queue[i])
			}
		}

		// remove interest marker from the main slide
		removeInterestMarker(main_slide)

		// wait 300ms, then go right
		setTimeout(function() { Reveal.right()}, 300);
	} else 
		Reveal.right()


}

// adds the URL for the given slide to our interest queue
// we assume we're getting the main slide here, we should check before passing section 
function queue(section) {

	// we keep post url in id of <section> tag
	var url = section.attr('id') 
	var title = section.children('.title').html()

	if (!hasInterestMarker(section)) {

	  	// add url to queue as a json object
	  	read_queue.push({
	  		url:url,
	  		title:title
	  	})

	  	// add visual feedback to the main slide to mark interest
	  	addInterestMarker(section)

	}
	

}

// this gets called whenever a div with datatype "loadmeta" is the current slide. we use it to load the preview embed on demand.
// Reveal.addEventListener( 'loadmeta', function() {
// 	
// 	//for some reason, this is not the slide we want, but the slide we just came from
// 	var current_slide = Reveal.getCurrentSlide()
// 
// 	// get the slide we want
// 	var ours = $(current_slide).next()
// 					
// 					
// 	// if we haven't loaded it already,
// 	if (ours.children(".embed").html() == undefined) {
// 		ours.embedly({
// 			query: { maxwidth: 520, wmode: 'transparent'},
// 			key: 'd783a092be4446d1b18f0932593c59a5',
// 			done: function(data){
// 					//remove spinner when loaded
// 					ours.children(".wait").remove();
// 					// HACK
// 					Reveal.up(); Reveal.down() 
// 				}
// 		})
// 	}
// 
// }, false );

// takes a jquery object and puts an interest marker on it
// static/img/i.png is the interest marker
function addInterestMarker(slide) {
		slide.append("<div class='i'><img src='static/img/i.png'></div>")
}

function removeInterestMarker(slide) {
		slide.children('.i').remove()
}

// returns true if the slide has already been liked
function hasInterestMarker(slide) {
	if (slide.children('.i').html() == undefined)
		return false;
	return true
}

keylog = []
// adds char to memory, with timestamp
function note(char) {
  var d = new Date().getTime()
  keylog.push({key:char, time:d})
}

// if we are at end of list, open up all the urls
// NB: this is triggered when 'l' key is pressed AND whenever queue() is called
function checkIfEndOfFeed() {

	if (Reveal.isLastSlide()) {

		// post the json object to server
		$.ajax({
			type: 'POST',
			url: '/done',
			contentType: 'application/json',
			dataType:'json',
			data: JSON.stringify({posts: read_queue, log:keylog}),
			success: function(data) {
				document.body.innerHTML = data.html
			}
		})
	}

}

// returns jquery object of the main slide (i.e., not the preview slide)
// and brings Reveal back up to the main slide, if we're in the preview 
function getAndGoToMainSlide(slide) {

	// if we're on a main display slide,
	if ($(slide).attr('id')) {

		return $(slide)

	}

	// get the main slide 
	var main_slide = $(slide).prev()

	// if not, we're on meta - go up
	Reveal.up()

	return main_slide
}

function embedPreviews() {

	$('a').embedly({
 		query: { maxwidth: 520, wmode: 'transparent'},
 		key: 'd783a092be4446d1b18f0932593c59a5',
 		done: function(data){}
	})

}

// remove an item from an array
function remove(arr, item) {
	for(var i = arr.length; i--;) {if(arr[i] === item) {arr.splice(i, 1); } } return arr } 
