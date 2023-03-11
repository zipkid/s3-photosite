import {
    S3Client,
    ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import {
    CognitoIdentityClient 
} from "@aws-sdk/client-cognito-identity";
import {
    fromCognitoIdentityPool
} from "@aws-sdk/credential-provider-cognito-identity";

// Constants
const REGION = 'eu-west-1';
const IDENTITY_POOL_ID = 'eu-west-1:28679384-ebdb-4656-a526-74bc6dbf89a8';
const albumBucketName = 'devopsdays.zipkid.eu';
const albumsPrefix = 'albums/';

var pathname = window.location.pathname; // Returns path only (/path/example.html)
var url      = window.location.href;     // Returns full URL (https://example.com/path/example.html)
var origin   = window.location.origin;   // Returns base URL (https://example.com)
// window.location.href = "http://stackoverflow.com"; // Set URL

console.log(`origin : ${origin} - url : ${url} - pathname : ${pathname}`)

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
export const album = urlParams.get('a')
export const sub_album = urlParams.get('s')
export const photo = urlParams.get('p')

console.log('queryString: ' + queryString);

const s3Client = new S3Client({
    region: REGION,
    credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({region: REGION}),
        identityPoolId: IDENTITY_POOL_ID,
    }),
});

// A utility function to join an array of HTML snippets.
function getHtml(template) {
    return template.join('\n');
}

const bucket_data = async () => {
    let content_data = []
    const command = new ListObjectsV2Command({
        Bucket: albumBucketName,
        Prefix: albumsPrefix,
        MaxKeys: 10,
    });
    try {
        let isTruncated = true;
        let contents = [];
        while (isTruncated) {
            const { Contents, IsTruncated, NextContinuationToken } = await s3Client.send(command);
            Contents.map((c) => contents.push(`${c.Key}`));
            isTruncated = IsTruncated;
            command.input.ContinuationToken = NextContinuationToken;
        }
        content_data = parse_contents(contents)
    } catch (err) {
        console.error(err);
    }
    return content_data;
};

function parse_contents(contents) {
    var data = {}
    for (const key of contents) {
        var path = key.split('/');
        if ( ( path.slice(-1) == '.dir' ) || ( path.includes('full') ) ) { continue; }
        var albumName = path[1];
        if ( ! (albumName in data) ) {
            data[albumName] = {
                key: path.slice(0, 2).join('/'),
                path: path.slice(0, 2),
                albums: {},
                photos: {},
            }
        }
        if( path.slice(2).length == 1 ) {
            data[albumName]['photos'][path[2]] = { key: key, path: path, name: path[2] };
        }
        if( path.slice(2).length == 2 ) {
            var subAlbumName = path[2]
            if ( ! (subAlbumName in data[albumName]['albums']) ) {
                data[albumName]['albums'][subAlbumName] = {
                    key: path.slice(0,3).join('/'),
                    path: path.slice(0,3),
                    photos: {},
                }
            }
            data[albumName]['albums'][subAlbumName]['photos'][path[3]] = {key: key, path: path, name: path[3] };
        }
    }
    return data;
}

function build_album_list(data, parent) {
    let album_html = []
    for ( const albumName of Object.keys(data).sort() ) {
        album_html.push( getHtml([
            '<li>',
                '<button style="margin:5px;" onclick="EntryPoint.build_album(\'' + albumName + '\', \'' + parent +'\')">',
                    albumName,
                '</button>',
            '</li>'
        ]));
    }
    return album_html;
}

function build_album_list_html(data) {
    let albums = build_album_list(data)
    var htmlTemplate = [
        '<h2>Albums</h2>',
        '<ul>',
            getHtml(albums),
        '</ul>',
    ]
    return htmlTemplate;
}

export function album_list() {
    promise_data.then(function(data) {
        let htmlTemplate = build_album_list_html(data)
        document.getElementById('viewer').innerHTML = getHtml(htmlTemplate);
    })
}

function build_photo_list(data) {
    let photos_html = []
    for ( const photoName of Object.keys(data).sort() ) {
        let photo = data[photoName]
        let path = photo['path']

        var photoUrl = photo['key'];
        var fullPhotoUrl = path.slice(0, (path.length - 1)).join('/') + '/full/' + photo['name']
        photos_html.push( getHtml([
            '<a href="' + fullPhotoUrl + '">',
                '<img src="' + photoUrl + '"/></a>',
            '</a>',
        ]));
    }
    /*
        <video controls="controls" width="800" height="600" name="Video Name">
            <source src="http://www.myserver.com/myvideo.mov">
        </video>
    */
    return photos_html;
}

function build_album_html(albumName, data, parent) {
    console.log(data)
    console.log(parent)
    console.log(typeof parent)
    let album = []
    if ( parent === 'undefined' ) {
        album = data[albumName]
    } else {
        album = data[parent]['albums'][albumName]
    }
    let photos = album['photos']
    let albums = []
    if ('albums' in album ) {
        albums = build_album_list(album['albums'], albumName)
    }
    let photos_html = build_photo_list(photos)
    var htmlTemplate = [
        '<div>',
            '<button onclick="EntryPoint.album_list()">',
                'Back To Albums',
            '</button>',
        '</div>',
        "<h2>Album: " + albumName + "</h2>",
        '<ul>',
            getHtml(albums),
        '</ul>',
        '<div id="lightgallery">',
            getHtml(photos_html),
        '</div>',
        '<div>',
            '<button onclick="EntryPoint.album_list()">',
                'Back To Albums',
            '</button>',
        '</div>',
    ]
    document.getElementById('viewer').innerHTML = getHtml(htmlTemplate);
    const $dynamicGallery = document.getElementById('lightgallery');
    const dynamicGallery = lightGallery($dynamicGallery, {
        plugins: [lgZoom, lgThumbnail],
        speed: 500,
    });
}

export function build_album(albumName, parent) {
    promise_data.then(function(data) {
        build_album_html(albumName, data, parent)
    })
}

var promise_data = bucket_data();

if ( typeof promise_data === 'object' && promise_data !== null && 'then' in promise_data ) {
    album_list()
}
