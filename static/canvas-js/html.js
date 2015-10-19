/*--------------------------------------------------------------------------*/
/*  HTML.JS								    */
/*    Routines to initiate the Twitter sentiment app (so a mainline, in a   */
/*    sense)
/* 									    */
/*- Modification History: --------------------------------------------------*/
/*  When:	Who:			Comments:			    */
/* 									    */
/*  01-May-12	Christopher G. Healey	Initial implementation		    */
/*--------------------------------------------------------------------------*/

function initGUI(){
  var  q;				// Query string on URL
  var  script;				// Google maps API script
  var  src;				// Google maps API script source URL


//  Stub out console.log() calls, if the function doesn't exist (IE!)

  if ( !window.console ) window.console = { };
  if ( !window.console.log ) window.console.log = function() { };

//  Set the label on the query button, and set it to trigger on click,
//  NB, this also "initializes" .ui-state-default, which is needed
//  later in this script (so do this step first)

  $("#query-btn").button( { label: "Query" } );
  $("#query-btn").click( function() {
    var  resp;				// Facebook authorization response

  //  If we see an "fb" query, assume we want to query the user's
  //  Facebook news feed, this has to be done in click() otherwise the
  //  login popup is likely to be blocked

    if ( $("#query-inp").val() == "fb" ) {
      $("#query-inp").val( "" );	// Clear special input

      if ( !window.FB ) {		// Facebook API not loaded?
        console.log( "Facebook pull requested but API not loaded" );
        return;
      }

      FB.Event.subscribe( 'auth.statusChange', fb_auth_change );

      resp = FB.getAuthResponse();
      if ( resp != null ) {		// Already authorized
        fb_load_news();
      } else {				// Must login and/or authorize
        FB.login( fb_load_news, { scope: 'read_stream' } );
      }

    } else {				// Regular Twitter query
      //query_twitter( document.getElementById( "query-inp" ).value, 15 );
      query_twitter_v_1_1( document.getElementById( "query-inp" ).value, 15 );
    }
  } );

//  Grab the default text colour, so it can be used elsewhere, even if
//  jQuery changes it, we do this IMMEDIATELY AFTER the first jQuery
//  call to setup the colour

  default_txt_c( $(".ui-state-default").css( "color" ) );

//  Set the icon on the zoom button, and set it to trigger on click,
//  NB, it's CRITICAL that text "Zoom In" is in HTML between
//  <button></button> tags, because that sets button's width and
//  height; the text flag disables DRAWING text in the button

  $("#zoom-btn").button( {
    icons: {
      primary: "ui-icon-zoomin"
    },
    text: false
  } );

  $("#zoom-btn").click( function() {
    if ( zoom_dlg().dialog( "isOpen" ) ) {
      hide_zoom_dlg();
    } else {
      show_zoom_dlg();
    }
  } );

//  Register callbacks to track which tab is active, and to resize a
//  tab's content (and hide or show the zoom button) when tab is shown
//  or window is resized

  $("#canvas-tab").tabs( {
    active: 0,
    beforeActivate: function( e, ui ) {
      tab_ID( ui.newTab.index() );
    },
    activate: function( e, ui ) {
      switch( tab_ID() ) {		// Control display of zoom button
      case 0:				// Tweet canvas
      case 1:				// Topic canvas
        $("#zoom-btn").show();
        break;
      default:				// All other tabs
        $("#zoom-btn").hide();
        break;
      }

      resize_canvas();
      update_zoom_dlg();
    }
  } );

  $(window).resize( function() {
    resize_canvas();
  } );

//  Sentiment tab is active (above) when tabs created, but we still
//  need to explicitly update the tab ID and the tab's width/height

  tab_ID( 0 );
  resize_canvas();

//  Set the "Keyword:" label to have the same font and colour as the
//  "Query" button

  style_txt( "#query-lbl" );

  //  Set the query input field to trigger on Return

  $("#query-inp").keydown( function( e ) {
    if ( ( e.keyCode == 13 ) ) {
      //query_twitter( document.getElementById( "query-inp" ).value, 15 );
      query_twitter_v_1_1( document.getElementById( "query-inp" ).value, 15 );

      e.stopPropagation();		// Don't propagate keypress up
      return false;			// Stop IE event bubbling
    }
  } );

//  Set a qtip tooltip to provide instructions when the user mouses
//  over the query input field, and focus on the field

  $("#query-inp").qtip( {
    content: "Choose one or more keywords to query from Twitter\'s recent tweet stream",
    show: { delay: 665 },
    position: { my: "bottom left", at: "top right" },
    style: { classes: "qtip-blue qtip-shadow qtip-rounded" }
  } );
  $("#query-inp").focus();

//  Set a qtip tooltip to provide instructions when the user mouses
//  over the visualization legend

  $("#tweet-legend").qtip( {
    content: "Pleasant tweets are green, and unpleasant tweets are blue. Larger or more opaque tweets represent more confident sentiment estimates, while smaller or more transparent tweets represent less confident estimates.",
    show: { delay: 665 },
    position: { my: "center left", at: "center right" },
    style: { classes: "qtip-blue qtip-shadow qtip-rounded" }
  } );


  //  Track mouse focus on the sentiment and topic canvases, to diallow
  //  tooltips if the canvas doesn't have focus

  $("#tweet-canvas").hover(
    function() {			// Mouse in function
      tweet_focus( true );
    },
    function() {			// Mouse out function
      tweet_focus( false );
    }
  );

//  Enable jQuery's active counter on the number of pending AJAX
//  requests


  init_tweet();				// Initialize scatterplot  
  draw_legend();			// Draw sentiment tab's legend
  draw_tweet();				// Draw sentiment tab's axes
}