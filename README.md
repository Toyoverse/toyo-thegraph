# First Steps

graph init --product hosted-service toyo-subgraph/toyo

Next steps:

  1. Run `graph auth` to authenticate with your deploy key.

  2. Type `cd toyo` to enter the subgraph.

  3. Run `npm run deploy` to deploy the subgraph.

Make sure to visit the documentation on https://thegraph.com/docs/ for further information.

# Build

`npx graph codegen`

`npx graph build`

# Deploy

## On Hosted Service

`npm run deploy`

`npm run upgrade`

## On Self-Hosted Service

`docker-compose up -d`

`npm run create-local`

`npm run deploy-local`

https://docs.harmony.one/home/developers/tutorials/the-graph-subgraphs/building-and-deploying-subgraph-local-node

## Subgraph endpoints

### Queries (HTTP)

https://api.thegraph.com/subgraphs/name/toyo-subgraph/toyo

### Subscriptions (WS)

wss://api.thegraph.com/subgraphs/name/toyo-subgraph/toyo

### Playground

https://thegraph.com/hosted-service/subgraph/toyo-subgraph/toyo