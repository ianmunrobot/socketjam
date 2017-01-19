module.exports = {
    entry: "./app/index.js",
    output: {
        path: __dirname,
        filename: "./public/js/bundle.js"
    },
    context: __dirname,
      devtool: 'source-map',
      resolve: {
        extensions: ['', '.js', '.jsx']
      },
    module: {
        loaders: [
            {
              test: /\.css$/, loader: "style!css" ,
              exclude: /(node_modules|bower_components)/,
              loader: 'babel',
              query: {
                presets: ['es2015', 'stage-2']
              }
            }
        ]
    },
};
