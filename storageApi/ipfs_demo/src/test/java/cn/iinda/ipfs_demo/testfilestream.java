package cn.iinda.ipfs_demo;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.FileInputStream;
import java.io.FileNotFoundException;

public class testfilestream {
    FileInputStream fis;

    {
        try {
            fis = new FileInputStream("/Users/lwy1218/Downloads/testipfs.7z");
            byte[] buffer = new byte[16000];
            while ( fis.read() != -1) {
                ;
            }
            int m=1;

        } catch (Exception e) {
            e.printStackTrace();
        }
    }


}
