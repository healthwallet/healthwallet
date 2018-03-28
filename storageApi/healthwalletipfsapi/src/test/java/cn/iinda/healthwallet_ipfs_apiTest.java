package cn.iinda;

import java.io.*;

import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;
public class healthwallet_ipfs_apiTest {
    static Logger logger = LogManager.getLogger(healthwallet_ipfs_apiTest.class.getName());
    //static Logger logger = LogManager.getLogger();
    public static void main(String args[]) throws IOException {
        healthwallet_ipfs_api ipfs = new healthwallet_ipfs_api("/ip4/192.168.2.9/tcp/5001");
        String hash = ipfs.AddFile("/Users/lwy1218/shihj/text1.txt");
        byte[] FileByte = ipfs.GetFile(hash);
        File outputFile = new File("/Users/lwy1218/shihj/output.txt");
        FileOutputStream outputFileStream = null;

        // try to open file output.txt
        try {
            outputFileStream = new FileOutputStream(outputFile);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        try {
            outputFileStream.write(FileByte);
        } catch (IOException e1) {
            e1.printStackTrace();
        }
        logger.debug("test finish!");
        String hash1 = ipfs.AddFileEncrypt ("/tmp/testipfs.7z","12345");
        //ipfs.GetFileEncrypt("/Users/lwy1218/shihj/output1.dcm",hash1,"12345");
        FileOutputStream fos = new FileOutputStream("/Users/lwy1218/shihj/output1.dcm");
        InputStream tmpStream1 = ipfs.GetInStreamEncrypt(hash1,"12345");
        int bytesRead = 0;
        byte[] buffer = new byte[16000];
        while ((bytesRead = tmpStream1.read(buffer)) != -1) {
            fos.write(buffer, 0, bytesRead);
        }
        tmpStream1.close();
        fos.close();
        String hash2 = ipfs.AddZipEncrypt ("/Users/lwy1218/shihj/12345","12345");
        ipfs.GetZipEncrypt(hash2,"/Users/lwy1218/shihj/output","12345");
        int i=0;

    }
    /*
    @Test
    public void healthwallet_ipfs_api() {
    }

    @Test
    public void addFile() {
    }

    @Test
    public void file() {
    }
    */
}