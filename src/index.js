import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
import "./styles.css";

import RadarChart from 'react-svg-radar-chart';
import 'react-svg-radar-chart/build/css/index.css'

import { Image, Button, Radio, Table, Icon, Segment, Grid, Divider, Feed, Progress, Statistic, Container} from "semantic-ui-react";



class App extends React.Component {
  state = {
    access_token : "",
    playlistTable_visible: false,
    trackTable_visible: false,
    currentlyPlayedTable_visible : 0,
    playlist_id : "",
    youtube_visible : true,
    spotify_visible : true
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

    var api_key = "AIzaSyBDXfiGLFI3ZdCTBq-GgAKHOhJ8Wv6-Sck"
    var video_id = "tIRj5P2ABew"
    var max_results = 2

    //const apiCallComments = 'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&key='+api_key+'&videoId='+video_id+'&maxResults='+max_results
    const apiCallLikes = 'https://www.googleapis.com/youtube/v3/videos/getRating?part=snippet&key='+api_key+'&videoId='+video_id+'&maxResults='+max_results
   
    fetch(apiCallLikes)
      .then(result => result.json())
      .then(data =>{
        console.log(data);
      })
  }

  display = e => {

    //getRequest("Tam Tam (Radio edit) - Sevenn")
    //this.fetchYoutubeApi();
    //https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&key=AIzaSyBDXfiGLFI3ZdCTBq-GgAKHOhJ8Wv6-Sck&videoId=Z2ol5_qmvsg&maxResults=1
  };


  handleSelectedPlaylist = (playlist_id) => {
    //console.log("searchTerm : ",playlist_id)
    this.setState({playlist_id : playlist_id});
    this.setState({playlistTable_visible : false})
    this.setState({trackTable_visible : true})
  }

  
  loadPlaylists = () => {
    if (this.state.access_token !== undefined ){
      this.setState({
        playlistTable_visible : !this.state.playlistTable_visible,
        trackTable_visible : false
      })
    }
  };
/*   unloadPlaylists = () => {
    this.setState({playlistTable_visible : 0})
    console.log(this.state.playlistTable_visible)
  }; */
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
      //debugger;
      console.log("window.location:", window.location)
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

    const loadButton = this.state.playlistTable_visible ? "Unload Playlists" : "Load Playlists" 
    //console.log("this state", this.state.playlistTable_visible)
    return(
      <div>
        <Table selectable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell style={{width: "30px"}}><div><Icon color="black" name='spotify' size='large' /> </div></Table.HeaderCell>
              <Table.HeaderCell style={{width: "30px"}}><Button onClick={this.authorize}>Connect to API</Button> </Table.HeaderCell>
              <Table.HeaderCell style={{width: "30px"}}><Button onClick={this.loadPlaylists}>{loadButton}</Button></Table.HeaderCell>
              <Table.HeaderCell style={{width: "30px"}}><Radio toggle defaultChecked={true} label="Show Youtube" onChange={() => this.setState({youtube_visible: !this.state.youtube_visible})}/>   </Table.HeaderCell>
              <Table.HeaderCell style={{width: "30px"}}><Radio toggle defaultChecked={true} label="Show Spotify" onChange={() => this.setState({spotify_visible: !this.state.spotify_visible})}/>   </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
        </Table>

        
        
        <Container>

          <center>
{/*           <button onClick={this.authorize}>Connect to API</button>
          <button onClick={this.display}>Debug</button>
          <button onClick={this.loadPlaylists}>{loadButton}</button> */}

         
          {
            this.state.playlistTable_visible
            ? <PlaylistTable 
              token={this.state.access_token} 
              onSelectedPlaylistChange={this.handleSelectedPlaylist}/> 
            : <div>{/* Playlists non chargées */} </div>
          }
          
          {
            this.state.trackTable_visible
            ? <TrackTable 
              token={this.state.access_token} 
              playlist_id={this.state.playlist_id}
              youtube_visible={this.state.youtube_visible}
              spotify_visible={this.state.spotify_visible}/> 
            : <div>{/* Tracktable non chargée */} </div>
          }

          {this.state.currentlyPlayedTable_visible === 1 ? <CurrentlyPlayingTable token={this.state.access_token}/> : <div>Rien en écoute pour le moment </div>}
          </center>

        </Container>
      </div>
      
    )
    
  };
}


var apiCall = (url, access_token) => {
  //console.log(url);
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
    //console.log("playlistid: ", playlistid)
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

    //console.log("firstPage : "+firstPage)

    apiCall(url,token).then( function(response){
      userId = response.id;

      // Show starred playlist if viewing first page
      if (firstPage) {
        return $.when.apply($, [
          //apiCall("https://api.spotify.com/v1/users/" + userId + "/starred",token),
          apiCall("https://api.spotify.com/v1/users/" + userId + "/playlists",token)
        ])
      } else {
        return apiCall(url, token);
      }
      //console.log(response)
      
    }).done(function() {
      //console.log("arguments[1]: " + arguments[1]);
      var response;
      var playlists = [];

      if (arguments[1] === 'success') {
        response = arguments[0];
        playlists = arguments[0].items;
      } else {
        response = arguments[1][0];
        playlists = $.merge([arguments[0][0]], arguments[1][0].items);
      }

      //console.log("response: ");
      //console.log(response);
      //console.log("playlists: ");
      //console.log(playlists);

      if (this._isMounted) {
        this.setState({
          playlists: playlists,
          playlistCount: response.total,
          nextURL: response.next,
          prevURL: response.previous,
          playlistTable_updated : 1
        });
        //console.log("set state executed in getPlaylists:", this.state);
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
    //console.log("un :",prevState.playlist_id)
    //console.log("deux: ",this.state.playlist_id)
    //console.log("component did update here: ",this.state.playlist_id)
    if(prevState.playlist_id !== this.state.playlist_id) {
      this.props.onSelectedPlaylistChange(this.state.playlist_id)
      //console.log("different")
    }
  }

  
  render(){

      //console.log("appel playlistTable :")
      if (this.state.playlists.length > 0) {
        
        return (
          <div id="playlists">
            <Table selectable>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell style={{width: "30px"}}></Table.HeaderCell>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell style={{width: "150px"}}>Owner</Table.HeaderCell>
                  <Table.HeaderCell style={{width: "100px"}}>Tracks</Table.HeaderCell>
                  <Table.HeaderCell></Table.HeaderCell>
                  {/* <th style={{width: "100px"}} className="text-right"><button className="btn btn-default btn-xs" type="submit" onClick={this.exportPlaylists}><span className="fa fa-file-archive-o"></span> Export All</button></th> */}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {
                  this.state.playlists.map(function(playlist) {
                    return <PlaylistRow 
                      key={playlist.id} 
                      playlist={playlist} 
                      token={this.props.token} 
                      onSelectedPlaylist={this.onSelectedPlaylistStatus}
                    />;
                  }.bind(this))
                }
              </Table.Body>
            </Table>
          </div>
        );
      } else {
        return <div className="spinner"></div>
      }

  };//end of render
}

class PlaylistRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      key: null
    };
  }

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
    //console.log("appel PlaylistRow :", playlist)
    //image / playlist.images[0].url
    if(playlist.uri==null) return (
      <Table.Row onClick={this.handleClick} key={playlist.id}>
        <Table.Cell>{this.renderIcon(playlist)}</Table.Cell>
        <Table.Cell>{playlist.name}</Table.Cell>
        <Table.Cell colSpan="2">not supported</Table.Cell>
        <Table.Cell>&nbsp;</Table.Cell>
      </Table.Row>
    );
    return (
      <Table.Row onClick={this.handleClick} key={playlist.id}>
        {/* <td>{this.renderIcon(playlist)}</td> */}
        <Table.Cell><img src={playlist.images[0].url} alt="Playlist cover" style={{ width: "60px" }}/></Table.Cell>
        <Table.Cell><a href={playlist.uri}>{playlist.name}</a></Table.Cell>
        <Table.Cell><a href={playlist.owner.uri}>{playlist.owner.id}</a></Table.Cell>
        <Table.Cell>{playlist.tracks.total}</Table.Cell>
        <Table.Cell className="text-right"><Button onClick={this.handleClick}>Export</Button></Table.Cell>
        {/* <Table.Cell className="text-right"><button className="btn btn-default btn-xs btn-success" type="submit" onClick={this.handleClick}><span className="glyphicon glyphicon-save"></span> Export</button></Table.Cell> */}
      </Table.Row>
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
      //console.log("response:", response)

      var tracks = [];

      tracks = response.items;
      //console.log(tracks);
      //console.log(response.total);

      if (this._isMounted) {
        this.setState({
          tracks: tracks,
          tracksCount: response.total
        });
      }

    }.bind(this))  

  };


  componentDidMount(){
    this._isMounted= true;
    this.analyzePlaylist(this.props.playlist_id);
    //console.log("componentDidMount:", this.props.playlist_id)
  }

  componentDiUnmount(){
    this._isMounted= false;
  }

  componentDidUpdate(){
   // this.analyzePlaylist(this.state.playlist_id);
    //console.log("componentDidUpdate: ", this.props.playlist_id)
  }

  render(){

    //console.log(this.state.tracks)

    if (this.state.tracks.length > 0) {
      return (
        <div id="tracklist">

          <Table selectable>
            <Table.Header>
              <Table.Row>
                {/* <Table.HeaderCell /> */}
                <Table.HeaderCell>Cover</Table.HeaderCell>
                <Table.HeaderCell>Title</Table.HeaderCell>
                <Table.HeaderCell>Artist</Table.HeaderCell>
                <Table.HeaderCell>Score</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            
            {this.state.tracks.map(function(track, i) {
              //console.log(i," : ", track.track.name)
              return <TrackRow 
                track={track.track} 
                key={track.track.id} 
                token={this.props.token} 
                onSelectedPlaylist={this.onSelectedPlaylistStatus}
                preview_mp3={track.track.preview_url}
                youtube_visible={this.props.youtube_visible}
                spotify_visible={this.props.spotify_visible}
              />;
            }.bind(this))}
          </Table> 
        </div>
      );
    } else {
      return <div className="spinner"></div>
    }
  }
}





class TrackRow extends React.Component {

  constructor() {
    super();
    this.state = {
      data: [
        { null: "" }
      ],
      expandedRows: []
    };
  }

  componentDidMount(){
    //this._isMounted= true;
  }

  componentDiUnmount(){
    //this._isMounted= false;
  }


  handleRowClick(rowId) {
    const currentExpandedRows = this.state.expandedRows;
    const isRowCurrentlyExpanded = currentExpandedRows.includes(rowId);

    const newExpandedRows = isRowCurrentlyExpanded
      ? currentExpandedRows.filter(id => id !== rowId)
      : currentExpandedRows.concat(rowId);

    this.setState({ expandedRows: newExpandedRows });
  }


  renderItemDetails(item){
    var track = this.props.track
    return  (
      <div>
        <Segment basic>
          <center>
            
            {
              this.props.spotify_visible
              ? <Grid columns={3}>
                  <Grid.Column>
                    <h5>Biography</h5>
                    <LastFmBiography lastfm_query={track.artists[0].name}/>
                  </Grid.Column>
                  <Grid.Column>
                    <h5>Artist popularity</h5>
                    <TagsAndPopularity uri={track.artists[0].uri} token={this.props.token}/>
                  </Grid.Column>
                  <Grid.Column>
                    <h5>Audio Features</h5>
                    <AudioAnalysis uri={track.uri} token={this.props.token}/>
                  </Grid.Column>
                </Grid>
              : <div></div>
            }

            { 
              this.props.youtube_visible && this.props.spotify_visible
              ? <Divider />
              : <div></div>
            }

            {
              this.props.youtube_visible
              ? <Grid columns={1}>
                  <Grid.Column>
                    <h5>Youtube Analysis</h5>
                    <YoutubeAnalysis youtube_query={track.name+" - "+track.artists[0].name} />
                  </Grid.Column>
                </Grid>
              : <div></div>
            }

          </center>
        </Segment>
      </div>
    ); 
  }


  renderItem(item, index) {
    let audio = new Audio(this.props.track.preview_url)
    const clickCallback = () => this.handleRowClick(index);
    var track = this.props.track
    const itemRows = [
      <Table.Row onClick={clickCallback} key={"row-data-" + index}>
        {/* <Table.Cell>{this.renderItemCaret(index)}</Table.Cell> */}
        <Table.Cell>
          {
            <img
              onMouseOver={() => audio.play()}
              onMouseLeave={() => audio.pause()}
              src={track.album.images[0].url}
              alt="track cover"
              style={{ width: "60px" }}
            />
          }
        </Table.Cell>
        <Table.Cell><a href={track.uri}>{track.name}</a></Table.Cell>
        <Table.Cell><a href={track.artists[0].uri}>{track.artists[0].name}</a></Table.Cell>
        <Table.Cell>4.37</Table.Cell>
      </Table.Row>
    ];

    if (this.state.expandedRows.includes(index)) {
      itemRows.push(
        <Table.Row key={"row-expanded-" + index}>
          <Table.Cell colSpan="5">{this.renderItemDetails(item)}</Table.Cell>
        </Table.Row>
      );
    }
    return itemRows;
  }


  render() {
    
    
    //console.log("render TrackRow:")

/*     if(track.uri==null) return (
      <tr key={this.props.key}>
        <td>{track.name}</td>
        <td colSpan="2">not supported</td>
        <td>&nbsp;</td>
      </tr>
    ); 
 */
    let allItemRows = [];

    this.state.data.forEach((item, index) => {
      const perItemRows = this.renderItem(item, index);
      allItemRows = allItemRows.concat(perItemRows);
    });

    return  (
      <Table.Body>
        {/* <Table.Cell colSpan="4"> */}
          {allItemRows}
        {/* </Table.Cell> */}
      </Table.Body>
    ); 
  }






}//End TrackRow





class LastFmBiography extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  getBiography = () => {
    const apiBiography= 'https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist='+this.props.lastfm_query+'&api_key=5f1ef2dc332e60a42232196316f22b3e&format=json'
    fetch(apiBiography)
      .then(result => result.json() )
      .then(data =>{
        //console.log(data)

        if (data.artist.bio.content){
          
          let selectedText = "<a href";
          let originalPhrase = data.artist.bio.content;

          originalPhrase = originalPhrase.slice(0,originalPhrase.indexOf(selectedText))
          this.setState({
            biography : originalPhrase/* ,
            artists_similar : data.artist.similar.artist[0].name, //get bug 
            listeners : data.artist.stats.listeners,
            playcount : data.artist.stats.playcount */
          }) //callback 
        }

        //console.log("state from LastFmBiography:", this.state.videoId)
      })
  }
  componentDidMount() {
    this.getBiography();
  }
  render () {

    return (
      <div className="scrollable" tabIndex="0">
        <div className="scrollable-content">
          {this.state.biography} 
        </div>
      </div>
    )

  }

}

class AudioAnalysis extends React.Component {
  constructor(props) {
    super(props);
    //this.RadarChart = React.createRef()
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
      //console.log("response",response)


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
          tracksCount: response.total,
          RadartChart_width : null
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
    //this.setState({RadartChart_width : this.RadarChart.current.offsetWidth})
    //console.log("SIzE WIDTH:", Number(this.RadarChart.current.offsetWidth))
    
  }

  componentWillUnmount(){
    this._isMounted = false;
  }

  render () {
    const af = this.state ; //af = audio features
    return ( 
      <div>
      {/* <div ref={this.RadarChart}>  */}
        {/* acousticness : {af.acousticness} <br></br>
        danceability : {af.danceability} <br></br>
        energy : {af.energy} <br></br>
        instrumentalness : {af.instrumentalness} <br></br> */}
        key : {af.key} <br></br>
        {/* liveness : {af.liveness} <br></br>
        loudness : {af.loudness} <br></br>
        speechiness : {af.speechiness} <br></br>
        tempo : {af.tempo} <br></br>
        valence : {af.valence} <br></br> */}
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
            /* size={Number(af.RadartChart_width)} */
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
      //token: "AIzaSyBDXfiGLFI3ZdCTBq-GgAKHOhJ8Wv6-Sck" , //API 1.1
      token: "AIzaSyBvYfIAeGQNgMm7xlqsA_JpTLr2KYbF-F8", //API 1.2 
      //token: "AIzaSyBnSwO8KaHN7Xt7CZGFdnuZcGzRyllc66Y", //API 2.1 
      videoId: "",
      viewCount: null,
      dislikeCount: null,
      commentCount: null,
      comments: [
        {authorChannelUrl:"", authorProfileImageUrl: "", textDisplay :"", likeCount:""}
      ],
      status_ok: "true"
    }
  }

  
  apiYoutubeSearch = (searchTerm) => {

    const apiSearch = 'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q='+searchTerm+'&key='+this.state.token
    fetch(apiSearch)
      .then(result => result.json() )
      .then(data =>{
        //console.log(data.items[0].id.videoId)
        this.setState({
          videoId : data.items[0].id.videoId,
          status_ok : true 
        },this.apiYoutubeComments(data.items[0].id.videoId)) //callback 

        //console.log("state from youtube serach:", this.state.videoId)
      }).catch(error => {
        this.setState({
          status_ok : false
        })
        console.error(error)
      })

  }


  apiYoutubeComments = (videoId) => {
    
    var max_results = 10 // Comments and likes
    //console.log("video_id::::", this.state.videoId)

    const apiCallComments = 'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&key='+this.state.token+'&videoId='+videoId+'&maxResults='+max_results
    //const apiCallLikes = 'https://www.googleapis.com/youtube/v3/videos?part=statistics&key=AIzaSyBDXfiGLFI3ZdCTBq-GgAKHOhJ8Wv6-Sck&id='+this.state.videoId
    
    fetch(apiCallComments)
      .then(result => result.json())
      .then(data =>{
          
          this.setState({
            comments: data.items.map(el => (
              {
                authorDisplayName: el.snippet.topLevelComment.snippet.authorDisplayName,
                authorChannelUrl : el.snippet.topLevelComment.snippet.authorChannelUrl,
                authorProfileImageUrl : el.snippet.topLevelComment.snippet.authorProfileImageUrl,
                textOriginal : el.snippet.topLevelComment.snippet.textOriginal,
                likeCount : el.snippet.topLevelComment.snippet.likeCount
              } 
            ))
          },this.apiYoutubeStatistics()); //callback

          //console.log("state from youtube comments:", this.state.videoId)
          //console.log(this.state.comments)
      })
  }

  apiYoutubeStatistics = () => {

    const apiCallStats = 'https://www.googleapis.com/youtube/v3/videos?part=statistics&key='+this.state.token+'&id='+this.state.videoId

    fetch(apiCallStats)
      .then(result => result.json() )
      .then(data =>{
        //console.log(data)
        this.setState({
          viewCount: data.items[0].statistics.viewCount,
          likeCount: data.items[0].statistics.likeCount,
          dislikeCount: data.items[0].statistics.dislikeCount,
          commentCount: data.items[0].statistics.commentCount,
          percentReaction: Number(( (Number(data.items[0].statistics.commentCount)/Number(data.items[0].statistics.viewCount))*100  ).toFixed(2))  ,
          percentAppreciation : Number((   (1 - ( (Number(data.items[0].statistics.dislikeCount)) / (Number(data.items[0].statistics.dislikeCount)+Number(data.items[0].statistics.likeCount))))*100 ).toFixed(2))        })
          //console.log("state from youtube statistics:", this.state)
      })
  }

  componentWillMount() {
    //this.getYoutubeAnalysis(this.props.youtube_query);
  }

  componentDidMount() {
    this._isMounted = true;
    this.apiYoutubeSearch(this.props.youtube_query);
  }

  componentWillUnmount(){
    this._isMounted = false;
  }

  render () {

    const comments = this.state.comments
    console.log("this.state.status_ok:", this.state.status_ok );
    return ( 
      <div> 
        <Segment basic>
          <center>
            <Grid columns={2}>
              <Grid.Column>
                <h5>Comments</h5>
                 <div class="scrollable" tabIndex="0">
                  <div class="scrollable-content">
                  {comments.map(comment => <YoutubeComments key={comment.authorChannelUrl} user={comment} status={this.state.status_ok}/> )}
                  </div>
                </div>
              </Grid.Column>
              <Grid.Column>
                <h5>Statistics</h5>
                <YoutubeStats video={this.state}/>
              </Grid.Column>
            </Grid>
          </center>
        </Segment>
      </div>
    )

  }
}


const YoutubeStats = (props) => (
  <div>

    {/* <h5>Reaction level</h5> */}

    <div>
      <div align="left"> 
      <Progress label="Reaction" percent={props.video.percentReaction} />
      </div>
    </div>

    <Statistic.Group size="mini">
        <Statistic>
          <Statistic.Value>{props.video.viewCount}</Statistic.Value>
          <Statistic.Label>Views</Statistic.Label>
        </Statistic>
        <Statistic size="mini">
          <Statistic.Value>{props.video.commentCount}</Statistic.Value>
          <Statistic.Label>Comments Number</Statistic.Label>
        </Statistic>
    </Statistic.Group>

    <br></br>
    <br></br>

    {/* <h5>Appreciation level</h5> */}
    <div>
      <div align="left"> 
      <Progress label="Appreciation" percent={props.video.percentAppreciation} />
      </div>
    </div>

    <center>
      <Statistic.Group size="mini">
        <Statistic>
          <Statistic.Value>{props.video.likeCount }</Statistic.Value>
          <Statistic.Label>Likes</Statistic.Label>
        </Statistic>
        <Statistic>
          <Statistic.Value>{props.video.dislikeCount }</Statistic.Value>
          <Statistic.Label>Dislikes</Statistic.Label>
        </Statistic>
      </Statistic.Group>
    </center>

  </div>
);

const YoutubeComments = (props) => (
  
  props.status
  ? <Feed>
      <Feed.Event>
        {/* <Feed.Label image={props.user.authorProfileImageUrl} /> */}
        <div align="left"> 
          <Image avatar verticalAlign="middle" src={props.user.authorProfileImageUrl} />
        </div>
        <Feed.Content>
          <Feed.Summary>
            <a href={props.user.authorChannelUrl}>{props.user.authorDisplayName}</a>
            <Feed.Date></Feed.Date> {/* //need to find the date somewhere */}
          </Feed.Summary>
          <Feed.Extra text>
            {props.user.textOriginal}
          </Feed.Extra>
          <Feed.Meta>
            <Feed.Like>
              <Icon name='like' />{props.user.likeCount} Likes
            </Feed.Like>
          </Feed.Meta>
        </Feed.Content>
      </Feed.Event>
    </Feed>

  : <p>Youtube comments    <br></br>
       can't be displayed, <br></br>
      Number of tokens reached...<br></br>
      <span role="img" aria-label="sheep">🐑🐑🐑🐑🐑<br></br>🐑🐑🐑🐑<br></br>🐑🐑🐑<br></br>🐑🐑<br></br>🐑</span>
    </p>



  
    /* <List>
      <List.Item>
        <Image avatar src={props.user.authorProfileImageUrl} />
        <List.Content>
          <List.Header as='a'><a href={props.user.authorChannelUrl}>{props.user.authorDisplayName}</a></List.Header>
          <List.Description>
            <p> {props.user.textOriginal} Likes: {props.user.likeCount}</p>
            <br></br>
          </List.Description>
        </List.Content>
      </List.Item>
    </List> */

    /* <img src={props.user.authorProfileImageUrl}/>
    <br></br>
    <a href={props.user.authorChannelUrl}>{props.user.authorDisplayName}</a>
    <p> {props.user.textOriginal} Likes: {props.user.likeCount}</p>
    <br></br> */
);

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
      //console.log("response",response)


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
      //console.log("response",response)


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
    //console.log("genrees:",tp.genres);
    return ( 
      <div> 
        followers : {tp.followers} <br></br>
        popularity : {tp.popularity} <br></br>
        <br></br>
        {tp.genres.map(function (value, index, array) {
            /* return <div key={index}>{value}</div> */
            return <div class="ui tiny label" key={index}>{value}</div>
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
        //console.log(data);
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
      //console.log("isloaded");
      return <div>Chargement…</div>;
    } else {
      //console.log(item);
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

