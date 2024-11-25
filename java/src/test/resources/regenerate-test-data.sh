#!/usr/bin/env bash

cd ../../../.. || exit 1
root_dir=$(pwd)

cd typescript || exit 1

generate_ts_output() {
  local project_name=$1
  local output_file=$2

  # Generate report
  npx ts-node ./src/main.ts ../java/src/test/resources/"$project_name" -p -e react

  # Copy the generated report file to the specified output location
  cp ../java/src/test/resources/"$project_name"/.reports/jqa/ts-output.json ../java/src/test/resources/"$output_file"

  # Remove the current working directory from the file
  sed -i "s|${root_dir}||g" ../java/src/test/resources/"$output_file"
}

generate_ts_output java-it-core-basics-sample-project java-it-core-basics-sample-ts-output.json
generate_ts_output java-it-core-multi-sample-projects java-it-core-multi-sample-ts-output.json
generate_ts_output java-it-react-sample-project java-it-react-sample-ts-output.json
