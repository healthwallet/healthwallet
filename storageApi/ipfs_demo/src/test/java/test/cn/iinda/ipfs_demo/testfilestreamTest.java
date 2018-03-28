package test.cn.iinda.ipfs_demo; 

import junit.framework.Test; 
import junit.framework.TestSuite; 
import junit.framework.TestCase; 

/** 
* testfilestream Tester. 
* 
* @author <Authors name> 
* @since <pre>03/11/2018</pre> 
* @version 1.0 
*/ 
public class testfilestreamTest extends TestCase { 
public testfilestreamTest(String name) { 
super(name); 
} 

public void setUp() throws Exception { 
super.setUp(); 
} 

public void tearDown() throws Exception { 
super.tearDown(); 
} 



public static Test suite() { 
return new TestSuite(testfilestreamTest.class); 
} 
} 
