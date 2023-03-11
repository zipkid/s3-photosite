# s3-site

Github repo : <https://github.com/zipkid/s3-photosite>

## Inspiration & Tools

Based on : <https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-photos-view.html>

Slideshow : <https://www.lightgalleryjs.com/>

Javascript Webpack : <https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/webpack.html>

## Build

This installs npm packages to ./node_modules

```bash
npm install --save-dev webpack
npm install --save-dev path-browserify
npm install --save-dev @aws-sdk/client-s3
npm install --save-dev @aws-sdk/client-cognito-identity
npm install --save-dev @aws-sdk/credential-provider-cognito-identity

npm run build
```

## Reduce thumbnail images

OS X

```bash
sips -Z 300 *.jpg
```

## License

S3 Photo website
Copyright (C) 2023 Stefan Goethals

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
