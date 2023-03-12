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

/*
    S3 Photo website
    Copyright (C) 2023 Stefan Goethals https://github.com/zipkid/s3-photosite

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// Constants
const REGION = 'eu-west-1';
const IDENTITY_POOL_ID = 'eu-west-1:a4ab3344-77dc-4f44-bd07-ca1d4261ed54';
const albumBucketName = 'devopsdays.zipkid.eu';
const albumsPrefix = 'albums/';

var pathname = window.location.pathname; // Returns path only (/path/example.html)
var url      = window.location.href;     // Returns full URL (https://example.com/path/example.html)
var origin   = window.location.origin;   // Returns base URL (https://example.com)
// window.location.href = "http://stackoverflow.com"; // Set URL

console.log(`origin : ${origin} - url : ${url} - pathname : ${pathname}`)

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
export const album = urlParams.get('a') || ''
export const sub_album = urlParams.get('s') || ''
export const photo = urlParams.get('p') ||''

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

function addState(location, title = '', id = '1') {
    let stateObj = { id: id };
    window.history.pushState(stateObj, title, `${origin}/${location}`);
}

// Fetch S3 bucket object data
const bucket_data = async () => {
    let content_data = []
    const command = new ListObjectsV2Command({
        Bucket: albumBucketName,
        Prefix: albumsPrefix,
        // MaxKeys: 100,
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

// Create album & photo list from S3 object data
function parse_contents(contents) {
    var data = {}
    for (const key of contents) {
        var path = key.split('/');
        if ( ( path.slice(-1)[0].startsWith('.') ) || ( path.includes('full') ) ) { continue; }
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

export function main(album = '', sub_album = '', photo = '') {
    promise_data.then(function(data) {
        if ( (album !== '') && (sub_album !== '') ) {
            build_album(sub_album, album)
        } else if ( (album !== '') ) {
            build_album(album)
        } else {
            let htmlTemplate = build_album_list_html(data)
            document.getElementById('viewer').innerHTML = getHtml(htmlTemplate);
            addState('');
        }
    })
}

function build_album_list_html(data, parent) {
    let albums = build_album_list(data, parent)
    var htmlTemplate = [
        '<h2>Albums</h2>',
        '<ul>',
            getHtml(albums),
        '</ul>',
    ]
    return htmlTemplate;
}

function build_album_list(data, parent='') {
    let album_html = []
    for ( const albumName of Object.keys(data).sort() ) {
        album_html.push( getHtml([
            '<li>',
                `<button class="albumListItem" onclick="EntryPoint.build_album('${albumName}','${parent}')">`,
                    albumName,
                '</button>',
            '</li>'
        ]));
    }
    return album_html;
}

export function build_album(albumName, parent = '') {
    promise_data.then(function(data) {
        build_album_html(data, albumName, parent)
    })
}

function build_album_html(data, albumName, parent) {
    let album = []
    let location = ''
    let add_parent_link = false
    if ( parent == '' ) {
        album = data[albumName];
        location = `?a=${albumName}`;
    } else {
        album = data[parent]['albums'][albumName];
        location = `?a=${parent}&s=${albumName}`;
        add_parent_link = true;
    }
    let photos = album['photos']
    let albums = []
    if ('albums' in album ) {
        albums = build_album_list_html(album['albums'], albumName)
    }
    let photos_html = build_photo_list(photos)
    let parent_link = []
    if ( add_parent_link ) {
        parent_link = [
            `<button onclick="EntryPoint.main('${parent}')">`,
                `Back To ${parent}`,
            '</button>',
        ]
    }
    var htmlTemplate = [
        '<div>',
            `<button onclick="EntryPoint.main()">`,
                `Back To Albums`,
            '</button>',
            getHtml(parent_link),
        '</div>',
        getHtml(albums),
        '<div id="lightgallery">',
            getHtml(photos_html),
        '</div>',
        '<div>',
            `<button onclick="EntryPoint.main()">`,
                `Back To Albums`,
            '</button>',
            getHtml(parent_link),
        '</div>',
    ]
    document.getElementById('viewer').innerHTML = getHtml(htmlTemplate);
    addState(location);
    const $dynamicGallery = document.getElementById('lightgallery');
    const dynamicGallery = lightGallery($dynamicGallery, {
        plugins: [lgZoom, lgThumbnail],
        speed: 500,
    });
}

function build_photo_list(data) {
    let photos_html = []
    for ( const photoName of Object.keys(data).sort() ) {
        let photo = data[photoName]
        let path = photo['path']

        var photoUrl = photo['key'];
        var fullPhotoUrl = `${path.slice(0, (path.length - 1)).join('/')}/full/${photo['name']}`
        photos_html.push( getHtml([
            `<a href="${fullPhotoUrl}">`,
                `<img src="${photoUrl}"/></a>`,
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

var promise_data = bucket_data();

if ( typeof promise_data === 'object' && promise_data !== null && 'then' in promise_data ) {
    main(album, sub_album, photo)
}
