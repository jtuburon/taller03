/*--------------------------------------------------------------------------*/
/*  GLOBAL-VAR.JS							    */
/*    Global variables and routines to manipulate them			    */
/* 									    */
/*- Modification History: --------------------------------------------------*/
/*  When:	Who:			Comments:			    */
/* 									    */
/*  01-May-12	Christopher G. Healey	Initial implementation		    */
/*--------------------------------------------------------------------------*/

//  Program global variables

var  active_tab_ID = 0;			// Active tab (0=sentiment, 1=topic)
var  ARO = 0;				// (Constant) index for arousal vals
var  dflt_txt_col;			// Default text colour
var  MIN_TW = 5;			// Minimum tweets to form a cluster
var  mouse_x_pos;			// Current mouse X-position
var  mouse_y_pos;			// Current mouse Y-position
var  q_dlg_html;			// Tweet query progress dialog
var  TOT = 2;				// (Constant) index for total vals
var  topic_focus_f;			// Topic canvas has focus flag
var  tweet_focus_f;			// Tweet canvas has focus flag
var  VAL = 1;				// (Constant) index for valence vals
var  z_dlg_html =			// Zoom dialog
       $( "<div id=\"div-zoom\"></div>" );
var  zoom_focus_f;			// Zoom canvas has focus flag


function default_txt_c( col )

  //  Set or return default text colour
  //
  //  col:  Default colour
{
  if ( typeof col === "undefined" ) {	// No new value provided?
    return dflt_txt_col;		// Return value
  } else {
    dflt_txt_col = col;			// Set value
  }
}					// End function default_txt_c


function default_txt_fm()

  //  Return default text family
{
  return $(".ui-widget").css( "font-family" );
}					// End function default_txt_fm


function default_txt_sz()

  //  Return default text size
{
  return $(".ui-widget").css( "font-size" );
}					// End function default_txt_sz


function default_txt_wt()

  //  Return default text weight
{
  return $(".ui-state-default").css( "font-weight" );
}					// End function default_txt_wt


function elem_offset( cur_elem )

  //  Calculate the offset of the given element (usually a canvas or
  //  SVG element) on the page, returned as { x, y }
  //
  //  cur_elem:  Element to query offset
{
  var  tot_x_off = 0;			// Total X-offset of canvas on page
  var  tot_y_off = 0;			// Total Y-offset of canvas on page


  do {					// Calc offsets up the parent chain
    tot_x_off += cur_elem.offsetLeft;
    tot_y_off += cur_elem.offsetTop;
  } while( cur_elem = cur_elem.offsetParent );

  return { x: tot_x_off, y: tot_y_off };
}					// End function elem_offset


function get_canvas( canvas_ID )

  //  Return a reference to the given canvas element, or false if no
  //  such element exists
  //
  //  canvas_ID:  Canvas HTML id, if this is not passed the routine
  //              will return a reference to the canvas element on the
  //              currently active tab
{
  if ( typeof canvas_ID == "undefined" ) {
    switch( tab_ID() ) {
    case 0:
      canvas = document.getElementById( "tweet-canvas" );
      break;
    case 1:
      canvas = document.getElementById( "topic-canvas" );
      break;
    case 2:
      canvas = document.getElementById( "heatmap-canvas" );
      break;

    //  None of the other tabs have HTML canvas element

    default:
      canvas = false;
      break;
    }

  } else {
    canvas = document.getElementById( canvas_ID );
  }

  //  Ensure canvas exists, and that it has a valid context

  if ( !canvas || !canvas.getContext ) {
    return false;
  } else {
    return canvas;
  }
}					// End function get_canvas


function get_canvas_ID()

  //  Return the HTML id of the active canvas element
{
  switch( tab_ID() ) {
  case 0:				// Tweet canvas
    return "tweet-canvas";
  case 1:				// Topic canvas
    return "topic-canvas";
  case 2:				// Heatmap canvas
    return "heatmap-canvas";

  //  None of the other tabs have HTML canvas element, but the map and
  //  affinity divs allows tweets to show info_dlg's so we return
  //  their IDs for show_info_dlg()

  case 5:				// Map div
    return "map-div";

  case 6:				// Affinity div
    return "affinity-div";

  default:
    return "unknown-canvas";
  }
}					// End function get_canvas_ID


function init_progress_dlg()

  //  Initialize progress dialog
{
  q_dlg_html = $( "<div></div>" );	// Tweet query progress dialog

  q_dlg_html.html( "<p id=\"prog-msg\">Loading tweets...</p><div id=\"prog-bar\"></div>" );
  q_dlg_html.dialog(
    {
      title: "Query Twitter",
      dialogClass: "dialog-drop-shadow",
      autoOpen: false
    }
  );
  $( "#prog-bar" ).progressbar();	// Insert progress bar into dialog
}					// End routine init_progress_dialog


function mouse_x( x )

  //  Set or return mouse X-position
  //
  //  x:  New mouse X-position
{
  if ( typeof x === "undefined" ) {	// No new value provided
    return mouse_x_pos;			// Return value
  } else {
    mouse_x_pos = x;			// Set value
  }
}					// End function mouse_x


function mouse_y( y )

  //  Set or return mouse X-position
  //
  //  y:  New mouse Y-position
{
  if ( typeof y === "undefined" ) {	// No new value provided
    return mouse_y_pos;			// Return value
  } else {
    mouse_y_pos = y;			// Set value
  }
}					// End function mouse_y


function PHP_URL()

  //  Return the base PHP directory as a URL
{
  return PHP_location + "/";
}					// End function PHP_URL


function query_dlg()

  //  Return query progress dialog object
{
  return q_dlg_html;
}					// End function query_dlg


function query_dlg_msg( msg )

  //  Set query dialog's message
  //
  //  msg:  New message string
{
  $("#prog-msg").text( msg );
}					// End function query_dlg_msg


function query_dlg_title( t )

  //  Set query dialog's title
  //
  //  t:  New title string
{
  q_dlg_html.dialog( { title: t } );
}					// End function query_dlg_title


function style_txt( ID )

  //  Style the HTML text element
  //
  //  ID:    HTML ID of element
{
  $(ID).css( {				// Format CSS properties
    "color": default_txt_c(),
    "font-family": default_txt_fm(),
    "font-size": default_txt_sz(),
    "font-weight": default_txt_wt()
  } );
}					// End function style_txt


function tab_ID( id )

  //  Set or return active tab ID
  //
  //  id:  Active tab (0=sentiment, 1=topic)
{
  if ( typeof id === "undefined" ) {	// No new value provided?
    return active_tab_ID;		// Return value
  } else {
    active_tab_ID = id;			// Set value
  }
}					// End function tab_ID


function topic_focus( f )

  //  Set or return topic canvas focus flag
  //
  //  f:  Topic canvas focus flag
{
  if ( typeof f === "undefined" ) {	// No new value provided?
    return topic_focus_f;		// Return value
  } else {
    topic_focus_f = f;			// Set value
  }
}					// End function topic_focus


function tweet_focus( f )

  //  Set or return tweet canvas focus flag
  //
  //  f:  Tweet canvas focus flag
{
  if ( typeof f === "undefined" ) {	// No new value provided?
    return tweet_focus_f;		// Return value
  } else {
    tweet_focus_f = f;			// Set value
  }
}					// End function tweet_focus


function zoom_dlg()

  //  Return zoom dialog object
{
  return z_dlg_html;
}					// End function zoom_dlg


function zoom_focus( f )

  //  Set or return zoom canvas focus flag
  //
  //  f:  Zoom canvas focus flag
{
  if ( typeof f === "undefined" ) {	// No new value provided?
    return zoom_focus_f;		// Return value
  } else {
    zoom_focus_f = f;			// Set value
  }
}					// End function zoom_focus
