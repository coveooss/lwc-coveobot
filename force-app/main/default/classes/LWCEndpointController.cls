public with sharing class LWCEndpointController {

  @AuraEnabled(cacheable=true)
  public static string getEndpoint(String searchHub) {
    Map<String, Object> endpoint = CoveoV2.Globals.getEndpointData();
    endpoint.put('token', CoveoV2.Globals.generateSearchToken(
        new Map<String,Object>{
            'searchHub' => searchHub
        }
    ));
    return JSON.serialize(endpoint);
  }
}
