import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? "http://localhost:8081",
  realm: "polarix",
  clientId: "polarix_frontend",
});


export default keycloak;