import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
import "./styles.css";

import RadarChart from 'react-svg-radar-chart';
import 'react-svg-radar-chart/build/css/index.css'

import { Table, Icon, Segment, Grid, Divider } from "semantic-ui-react";




class App extends React.Component {
  state = {
    access_token : "",
    playlistTable_visible: 0,
    trackTable_visible: 0,
    currentlyPlayedTable_visible : 0,
    playlist_id : "parent_iddd"
  };

  componentDidMount(){
    var vars = window.location.hash.substring(1).split('&');
    var key = {};
    for (var i=0; i<vars.length; i++) {
      var tmp = vars[i].split('=');
      key[tmp[0]] = tmp[1];
    }
    this.setState({
      isAccess_token : vars,
      access_token : key["access_token"], 
      expires_in : key["expires_in"], 
      token_type : key["token_type"],
    }); 
  };



  fetchYoutubeApi = () => {
    const apiCall = 'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&key=AIzaSyBDXfiGLFI3ZdCTBq-GgAKHOhJ8Wv6-Sck&videoId=Z2ol5_qmvsg&maxResults=1'
    fetch(apiCall)
      .then(result => result.json())
      .then(data =>{
        console.log(data);
      })

  }

  display = e => {
    this.fetchYoutubeApi();
  /*console.log(this.getQueryParam("app_client_id"));
    console.log(window.location);
    console.log(this.state.playlists[1]); */
    //console.log(this.state.access_token);
    //console.log(this.state.token_type);
    //console.log(this.state.expires_in);
    //console.log(key["access_token"]);
    //console.log(key["expires_in"]);
    //console.log(key["token_type"]);
    //console.log(selected_playlist_id);
    //console.log(this.state.playlist_id);
    //https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&key=AIzaSyBDXfiGLFI3ZdCTBq-GgAKHOhJ8Wv6-Sck&videoId=Z2ol5_qmvsg&maxResults=1
  };


  handleSelectedPlaylist = (playlist_id) => {
    console.log("searchTerm : ",playlist_id)
    this.setState({playlist_id : playlist_id});
    this.setState({playlistTable_visible : 0})
    this.setState({trackTable_visible : 1})
  }

  
  loadPlaylists = () => {
    if (this.state.access_token !== undefined ){
      this.setState({playlistTable_visible : 1})
      console.log(this.state.access_token)
    }
  };
  unloadPlaylists = () => {
    this.setState({playlistTable_visible : 0})
    console.log(this.state.playlistTable_visible)
  };
  loadcurrentlyPlayedSong = () => {
    if (this.state.access_token !== undefined){
      this.setState({currentlyPlayedTable_visible : 1}); 
    } 
  };

  authorize = () => {
    var client_id = this.getQueryParam('app_client_id');

    if (client_id === '') {
      client_id = "d275773774d1430caead656c79eaccd0"
    }

    window.location = "https://accounts.spotify.com/authorize" +
      "?client_id=" + client_id +
      "&redirect_uri=" + encodeURIComponent([window.location.protocol, '//', window.location.host, window.location.pathname].join('')) +
      "&scope=playlist-read-private%20playlist-read-collaborative" +
      "&response_type=token";
  };


  // http://stackoverflow.com/a/901144/4167042
  getQueryParam = name => {
    // eslint-disable-next-line 
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(window.location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  };




  render(){
    return(
      <div>
        <center>
          <button onClick={this.authorize}>Connect to API</button>
          <button onClick={this.display}>Debug</button>
          <button onClick={this.loadPlaylists}>Load Playlists</button>
          <button onClick={this.unloadPlaylists}>Unload Playlists</button>
          <button onClick={this.loadcurrentlyPlayedSong}>Get Currently Playing</button>
          <br></br>
          <br></br>
          access_token : {this.state.access_token}
          <br></br>
          playlistTable_visible : {this.state.playlistTable_visible}
          <br></br>
          selected_playlist_id : {this.state.playlist_id}
          <br></br>

          <br></br>
          {this.state.playlistTable_visible === 1 ? <PlaylistTable token={this.state.access_token} onSelectedPlaylistChange={this.handleSelectedPlaylist}/> : <div>Playlists non chargées </div>}
          {this.state.trackTable_visible === 1 ? <TrackTable token={this.state.access_token} playlist_id={this.state.playlist_id}/> : <div>Tracktable non chargée </div>}
          {this.state.currentlyPlayedTable_visible === 1 ? <CurrentlyPlayingTable token={this.state.access_token}/> : <div>Rien en écoute pour le moment </div>}
        </center>
      </div>
    )
  };
}


var apiCall = (url, access_token) => {
  console.log(url);
  //console.log(access_token);
  return $.ajax({
    url: url,
    headers: {
      Authorization: "Bearer " + access_token
    }
  }).fail(function(jqXHR, textStatus) {
    if (jqXHR.status === 401) {
      // Return to home page after auth token expiry
      window.location = window.location.href.split("#")[0];
    } else if (jqXHR.status === 429) {
      // API Rate-limiting encountered
      window.location =
        window.location.href.split("#")[0] + "?rate_limit_message=true";
    } else {
      // Otherwise report the error so user can raise an issue
      alert(jqXHR.responseText);
    }
  });
};



class PlaylistTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playlists: [],
      playlistCount: 0,
      nextURL: null,
      prevURL: null,
      playlist_id: ""
    };
  }

  onSelectedPlaylistStatus = playlistid => {
    console.log("playlistid: ", playlistid)
    this.setState({playlist_id: playlistid });
    //seems like there is a delay to set state
    //console.log("this.state.playlist_id: ",this.state.playlist_id);
  };


  getPlaylists = token => {
    var userId = '';
    //setting url here will set firstPage : false
    var url
    var firstPage = typeof url === 'undefined' || url.indexOf('offset=0') > -1;
    url = "https://api.spotify.com/v1/me";

    console.log("firstPage : "+firstPage)

    apiCall(url,token).then( function(response){
      userId = response.id;

      // Show starred playlist if viewing first page
      if (firstPage) {
        return $.when.apply($, [
          apiCall("https://api.spotify.com/v1/users/" + userId + "/starred",token),
          apiCall("https://api.spotify.com/v1/users/" + userId + "/playlists",token)
        ])
      } else {
        return apiCall(url, token);
      }
      //console.log(response)
      
    }).done(function() {
      console.log("arguments[1]: " + arguments[1]);
      var response;
      var playlists = [];

      if (arguments[1] === 'success') {
        response = arguments[0];
        playlists = arguments[0].items;
      } else {
        response = arguments[1][0];
        playlists = $.merge([arguments[0][0]], arguments[1][0].items);
      }

      console.log("response: ");
      console.log(response);
      console.log("playlists: ");
      console.log(playlists);

      if (this._isMounted) {
        this.setState({
          playlists: playlists,
          playlistCount: response.total,
          nextURL: response.next,
          prevURL: response.previous
        });
        console.log(this.state);
        $('#playlists').fadeIn();
        $('#subtitle').text((response.offset + 1) + '-' + (response.offset + response.items.length) + ' of ' + response.total + ' playlists for ' + userId)
      }
    }.bind(this)) //bind is mandatory to apply setState in a querry function
  }



  componentDidMount() {
    this._isMounted = true;
    this.getPlaylists(this.props.token);
  }

  componentWillUnmount(){
    this._isMounted = false;
  }

  componentDidUpdate(prevProps,prevState){
    console.log("un :",prevState.playlist_id)
    console.log("deux: ",this.state.playlist_id)
    //console.log("component did update here: ",this.state.playlist_id)
    if(prevState.playlist_id !== this.state.playlist_id) {
      this.props.onSelectedPlaylistChange(this.state.playlist_id)
      console.log("different")
    }
  }

  
  render(){
    //if (this.props.playlistTable_visible)
      if (this.state.playlists.length > 0) {
        return (
          <div id="playlists">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th style={{width: "30px"}}></th>
                  <th>Name</th>
                  <th style={{width: "150px"}}>Owner</th>
                  <th style={{width: "100px"}}>Tracks</th>
                  {/* <th style={{width: "100px"}} className="text-right"><button className="btn btn-default btn-xs" type="submit" onClick={this.exportPlaylists}><span className="fa fa-file-archive-o"></span> Export All</button></th> */}
                </tr>
              </thead>
              <tbody>
                {this.state.playlists.map(function(playlist, i) {
                  return <PlaylistRow 
                    playlist={playlist} 
                    key={playlist.id} 
                    token={this.props.token} 
                    onSelectedPlaylist={this.onSelectedPlaylistStatus}
                  />;
                }.bind(this))}
              </tbody>
            </table>
          </div>
        );
      } else {
        return <div className="spinner"></div>
      }

  };//end of render
}

class PlaylistRow extends React.Component {
  

  handleClick = e => {
    this.props.onSelectedPlaylist(this.props.playlist.uri.replace("spotify:playlist:",""));
  };

  componentDidMount(){
    this._isMounted= true;
  }

  componentDiUnmount(){
    this._isMounted= false;
  }

  renderTickCross = (condition) => {
    if (condition) {
      return <i className="fa fa-lg fa-check-circle-o"></i>
    } else {
      return <i className="fa fa-lg fa-times-circle-o" style={{ color: '#ECEBE8' }}></i>
    }
  };

  renderIcon = (playlist) => {
    if (playlist.name === 'Starred') {
      return <i className="glyphicon glyphicon-star" style={{ color: 'gold' }}></i>;
    } else {
      return <i className="fa fa-music"></i>;
    }
  };

  render() {
    var playlist = this.props.playlist
    if(playlist.uri==null) return (
      <tr key={this.props.key}>
        <td>{this.renderIcon(playlist)}</td>
        <td>{playlist.name}</td>
        <td colSpan="2">not supported</td>
        <td>&nbsp;</td>
      </tr>
    );
    return (
      <tr key={this.props.key}>
        <td>{this.renderIcon(playlist)}</td>
        <td><a href={playlist.uri}>{playlist.name}</a></td>
        <td><a href={playlist.owner.uri}>{playlist.owner.id}</a></td>
        <td>{playlist.tracks.total}</td>
        <td className="text-right"><button className="btn btn-default btn-xs btn-success" type="submit" onClick={this.handleClick}><span className="glyphicon glyphicon-save"></span> Analyse</button></td>
      </tr>
    );
  }
}

class TrackTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tracks: [],
      tracksCount: 0,
      playlist_id : ""
    };
  }

  analyzePlaylist = (p_id) => {
    //PlaylistExporter.export(this.props.access_token, this.props.playlist);
  
    //call api with p_id
    apiCall("https://api.spotify.com/v1/playlists/"+p_id+"/tracks",this.props.token).then( function(response){
      console.log(response)

      var tracks = [];

      tracks = response.items;
      console.log(tracks);
      console.log(response.total);

      if (this._isMounted) {
        this.setState({
          tracks: tracks,
          tracksCount: response.total
        });
      }

    }.bind(this)).done(function() {
      /* console.log(arguments[0]);
      console.log(arguments[1]);
      console.log(arguments); */
    }/*.bind(this)*/)  


  };


  componentDidMount(){
    this._isMounted= true;
    this.analyzePlaylist(this.props.playlist_id);
    console.log("componentDidMount:", this.props.playlist_id)
  }

  componentDiUnmount(){
    this._isMounted= false;
  }

  componentDidUpdate(){
   // this.analyzePlaylist(this.state.playlist_id);
    //console.log("componentDidUpdate: ", this.props.playlist_id)
  }

  render(){

    console.log(this.state.tracks)

    if (this.state.tracks.length > 0) {
      return (
        <div id="tracklist">
          <table className="table table-hover">
            <thead>
              <tr>
                <th style={{width: "30px"}}></th>
                <th>Name</th>
                <th style={{width: "150px"}}>Artist</th>
                <th style={{width: "100px"}}>Tracks</th>
                {/* <th style={{width: "100px"}} className="text-right"><button className="btn btn-default btn-xs" type="submit" onClick={this.exportPlaylists}><span className="fa fa-file-archive-o"></span> Export All</button></th> */}
              </tr>
            </thead>
            <tbody>
              {this.state.tracks.map(function(track, i) {
                //console.log(i," : ", track.track.name)
                return <TrackRow 
                  track={track.track} 
                  key={track.track.id} 
                  token={this.props.token} 
                  onSelectedPlaylist={this.onSelectedPlaylistStatus}
                />;
              }.bind(this))}
            </tbody>
          </table>
        </div>
      );
    } else {
      return <div className="spinner"></div>
    }
  }
}

class TrackRow extends React.Component {

  componentDidMount(){
    this._isMounted= true;
  }

  componentDiUnmount(){
    this._isMounted= false;
  }

  render() {
    
    var track = this.props.track
    console.log(track)
    if(track.uri==null) return (
      <tr key={this.props.key}>
        <td>{track.name}</td>
        <td colSpan="2">not supported</td>
        <td>&nbsp;</td>
      </tr>
    ); 
   return  (
      <tr key={this.props.key}>
        <td>
          <div style={{display: 'inline-block', width: "25%"}}>
            <img src={track.album.images[0].url} alt="track cover" style={{width: '60px'}}/>
          </div>
        </td>
        <td><a href={track.uri}>{track.name}</a></td>
        <td><a href={track.artists[0].uri}>{track.artists[0].name}</a></td>
        {/* later will be in the drop down pannel */}
        <AudioAnalysis uri={track.uri} token={this.props.token}/>
        <TagsAndPopularity uri={track.artists[0].uri} token={this.props.token}/> 
        {/* <YoutubeAnalysis youtube_query={track.name+" - "+track.artists[0].name} */} />
        <td>track.tracks.total</td>
        <td className="text-right"><button className="btn btn-default btn-xs btn-success" type="submit" onClick={this.handleClick}><span className="glyphicon glyphicon-save"></span> Analyse</button></td>
      </tr>
    ); 
  }
}


class AudioAnalysis extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
/*       audio_features : [ 
        {  */
          track_id : "",
          danceability: 0.735,
          energy: 0.578,
          key: 5,
          loudness: -11.84,
          mode: 0,
          speechiness: 0.0461,
          acousticness: 0.514,
          instrumentalness: 0.0902,
          liveness: 0.159,
          valence: 0.624,
          tempo: 98.002,
          type: "audio_features",
          id: "06AKEBrKUckW0KREUWRnvT",
/*           uri: "spotify:track:06AKEBrKUckW0KREUWRnvT",
          track_href: "https://api.spotify.com/v1/tracks/06AKEBrKUckW0KREUWRnvT",
          analysis_url: "https://api.spotify.com/v1/audio-analysis/06AKEBrKUckW0KREUWRnvT", */
          duration_ms: 255349,
/*           time_signature: 4  */
/*         }
      ] */
    }
  }

  getAudioFeatures = (t_id) => {

    //call api with p_id
    apiCall("https://api.spotify.com/v1/audio-features/"+t_id.replace("spotify:track:",""),this.props.token).then( function(response){
      console.log("response",response)


      if (this._isMounted) {
        this.setState({
          track_id: response.id,
          danceability: response.danceability,
          energy: response.energy,
          key: response.key,
          loudness: response.loudness,
          mode: response.mode,
          speechiness: response.speechiness,
          acousticness: response.acousticness,
          instrumentalness: response.instrumentalness,
          liveness: response.liveness,
          valence: response.valence,
          tempo: response.tempo,
          id: "06AKEBrKUckW0KREUWRnvT",
          tracksCount: response.total
        });
      }

    }.bind(this)).done(function() {
      /* console.log(arguments[0]);
      console.log(arguments[1]);
      console.log(arguments); */
    }/*.bind(this)*/)  

  }



  componentDidMount() {
    this._isMounted = true;
    this.getAudioFeatures(this.props.uri);
  }

  componentWillUnmount(){
    this._isMounted = false;
  }

  render () {
    const af = this.state ; //af = audio features
    return ( 
      <div> 
        acousticness : {af.acousticness} <br></br>
        danceability : {af.danceability} <br></br>
        energy : {af.energy} <br></br>
        instrumentalness : {af.instrumentalness} <br></br>
        key : {af.key} <br></br>
        liveness : {af.liveness} <br></br>
        loudness : {af.loudness} <br></br>
        speechiness : {af.speechiness} <br></br>
        tempo : {af.tempo} <br></br>
        valence : {af.valence} <br></br>
        <RadarChart
            captions={{
              // columns
              acousticness: 'acousticness',
              danceability: 'danceability',
              energy: 'energy',
              instrumentalness: 'instrumentalness',
              liveness: 'liveness',
              loudness: 'loudness',
              speechiness: 'speechiness',
              tempo: 'tempo',
              valence: 'valence'
            }}
            data={[
              // data
              {
                data: {
                  acousticness: af.acousticness,
                  danceability: af.danceability,
                  energy: af.energy,
                  instrumentalness: af.instrumentalness,
                  liveness: af.liveness,
                  loudness: af.loudness/-20,
                  speechiness: af.speechiness,
                  tempo: af.tempo/200,
                  valence: af.valence
                },
                meta: { color: '#58FCEC' }
              },
            ]}
            size={200}
          />
      </div>
    )
  }
}



class YoutubeAnalysis extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      views: null,
      likes: null,
      dislikes: null,
      comments: []
    }
  }

  getYoutubeAnalysis = (youtube_query) => {

    var api_key = "AIzaSyBDXfiGLFI3ZdCTBq-GgAKHOhJ8Wv6-Sck"
    var video_id = "Z2ol5_qmvsg"
    var max_results = 1

    apiCall("https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&key="+api_key+"&videoId="+video_id+"&maxResults="+max_results).then( function(response){
      
      console.log("response",response)
  
      if (this._isMounted) {
        this.setState({
          views: 2,
          likes: 2,
          dislikes: 2
          /* comments : response.items.map(i => (i)) */
        });
      }

    }.bind(this)).done(function() {
      /* console.log(arguments[0]);
      console.log(arguments[1]);
      console.log(arguments); */
    }/*.bind(this)*/)  

      

  }



  componentDidMount() {
    this._isMounted = true;
    this.getYoutubeAnalysis("");
    //this.getYoutubeAnalysis(this.props.youtube_query);
  }

  componentWillUnmount(){
    this._isMounted = false;
  }

  render () {
    const yi = this.state ; //yi=youtube indicators
    return ( 
      <div> 
        rien
        {/* views: {yi.views} <br></br>
        likes: {yi.likes} <br></br>
        dislikes: {yi.dislikes} <br></br>
        comments : {yi.comments.map( (item, index, array) => (
          <img style="float:left" class="rounded-circle" src={item.snippet.topLevelComment.snippet.authorProfileImageUrl} />
        ))} */}
        
    
      </div>
    )
  }
}





class TagsAndPopularity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        artist_id : "",
        genres : []
    }
  }

  getTagsAndPopularity = (a_id) => {

    apiCall("https://api.spotify.com/v1/artists/"+a_id.replace("spotify:artist:",""),this.props.token).then( function(response){
      console.log("response",response)


      if (this._isMounted) {
        this.setState({
          artist_id: response.id,
          followers: response.followers.total,
          popularity: response.popularity,
          genres: response.genres.map(genre => (genre))
        });
      }

    }.bind(this)).done(function() {
      /* console.log(arguments[0]);
      console.log(arguments[1]);
      console.log(arguments); */
    }/*.bind(this)*/);

    apiCall("https://api.spotify.com/v1/artists/"+a_id.replace("spotify:artist:",""),this.props.token).then( function(response){
      console.log("response",response)


      if (this._isMounted) {
        this.setState({
          artist_id: response.id,
          followers: response.followers.total,
          popularity: response.popularity,
          genres: response.genres.map(genre => (genre))
        });
      }

    }.bind(this)).done(function() {
      /* console.log(arguments[0]);
      console.log(arguments[1]);
      console.log(arguments); */
    }/*.bind(this)*/)

  }



  componentDidMount() {
    this._isMounted = true;
    this.getTagsAndPopularity(this.props.uri);
  }

  componentWillUnmount(){
    this._isMounted = false;
  }

  render () {
    const tp = this.state ; //tp = tag and popularity
    console.log("genrees:",tp.genres);
    return ( 
      <div> 
        followers : {tp.followers} <br></br>
        popularity : {tp.popularity} <br></br>
        {tp.genres.map(function (value, index, array) {
            return <div key={index}>{value}</div>
          })
        }
      </div>
    )
  }



}

class CurrentlyPlayingTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: null,
      token: null,
      item: {
        album: {
          images: [{ url: "" }]
        },
        name: "",
        artists: [{ name: "" }],
        duration_ms: 0
      },
      is_playing: "Paused",
      progress_ms: 0,
      count:0
    };
      //this.getCurrentlyPlaying = this.getCurrentlyPlaying.bind(this);
  }

  getCurrentlyPlaying = token => {
    // Make a call using the token
    // Make a call using the token
     $.ajax({
      url: "https://api.spotify.com/v1/me/player",
      type: "GET",
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      success: data => {
        this.setState({
          item: data.item,
          is_playing: data.is_playing,
          progress_ms: data.progress_ms,
          isLoaded: true
        });
        console.log(data);
      }
    }); 

/*     apiCall("https://api.spotify.com/v1/me/player",token).then( function(response){
      console.log(response)
    }.bind(this)).done(function() {
      console.log(arguments[1]);
    }.bind(this)) */
    
  };

  componentDidMount() {
    this.getCurrentlyPlaying(this.props.token);
  }

  render() {
    const { error, isLoaded, item } = this.state;
    if (error) {
      console.log("error");
      return <div>Erreur : {error.message}</div>;
    } else if (!isLoaded) {
      console.log("isloaded");
      return <div>Chargement…</div>;
    } else {
      console.log(item);
      const urls = item.album.images.map((i) => <li> {i.height} : {i.url} </li>)
      return (
        <div>
          {urls}
        </div>
      );
    }
    
  }
}


/* $(function() {
});  */

const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  rootElement
);

