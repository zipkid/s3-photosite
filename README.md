# s3-site

Based on https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-photos-view.html

CSS popup https://codesalad.dev/blog/how-to-create-an-image-lightbox-in-pure-css-25

Javascript Webpack https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/webpack.html


This installs npm packages to ./node_modules

```bash
npm install --save-dev webpack
npm install --save-dev path-browserify
npm install --save-dev @aws-sdk/client-s3
npm install --save-dev @aws-sdk/client-cognito-identity
npm install --save-dev @aws-sdk/credential-provider-cognito-identity

npm run build
```



```bash
sips -Z 300 *.jpg
```