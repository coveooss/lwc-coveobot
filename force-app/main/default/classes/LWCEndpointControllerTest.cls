@isTest
public class LWCEndpointControllerTest {
    @IsTest
    static void testEndpoint(){
        String testEndpoint = LWCEndpointController.getEndpoint('foo');
        System.assertNotEquals(testEndpoint, null);
    }
}
