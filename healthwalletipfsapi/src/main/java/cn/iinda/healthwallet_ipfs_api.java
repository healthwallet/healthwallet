package cn.iinda;
import io.ipfs.api.IPFS;
import io.ipfs.api.Version;
import io.ipfs.api.cbor.*;
import io.ipfs.cid.*;
import io.ipfs.api.NamedStreamable;
import io.ipfs.api.MerkleNode;
import io.ipfs.api.Version;
import io.ipfs.multihash.Multihash;
import io.ipfs.multiaddr.MultiAddress;
import java.io.*;
import java.lang.Byte;
import java.nio.file.*;
import java.util.*;
import java.util.function.*;
import java.util.stream.*;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;
import  cn.iinda.ZipCipherUtil;

public class healthwallet_ipfs_api {
    private  IPFS ipfs;
    //连接字符串：类似"/ip4/127.0.0.1/tcp/5001"；
    public  healthwallet_ipfs_api(String connstr) {
        ipfs = new IPFS(new MultiAddress(connstr));
    }
    //添加文件。
    public String AddFile(String strPath)  throws IOException{
        NamedStreamable.FileWrapper file = new NamedStreamable.FileWrapper(new File(strPath));
        MerkleNode addResult = ipfs.add(file).get(0);
        return addResult.hash.toString();
    }
    //获取文件
    public byte[] GetFile(String strHash)  throws IOException{
        Multihash FileHash = Multihash.fromBase58(strHash);
        byte[] getResult = ipfs.cat(FileHash);
        return getResult;
    }
    //添加加密文件。
    public String AddFileEncrypt(String strPath,String strKey)  throws IOException{
        ZipCipherUtil tmpZipCipherUtil = new ZipCipherUtil();
        File temp = new File(UUID.randomUUID().toString() + ".tmp");
        temp.deleteOnExit();
        try {
            tmpZipCipherUtil.decryptFile(strPath,temp.getAbsolutePath(),strKey);
        } catch (Exception e) {
            e.printStackTrace();
        }
        NamedStreamable.FileWrapper file = new NamedStreamable.FileWrapper(new File(temp.getAbsolutePath()));
        MerkleNode addResult = ipfs.add(file).get(0);
        temp.delete();
        return addResult.hash.toString();
    }
    //获取加密文件
    public OutputStream GetFileEncrypt(String strHash,String strOutFile,String strKey)  throws IOException{
        ZipCipherUtil tmpZipCipherUtil = new ZipCipherUtil();
        Multihash FileHash = Multihash.fromBase58(strHash);
        //byte[] getResult = ipfs.cat(FileHash);
        InputStream tmpStream = ipfs.catStream(FileHash);
        FileOutputStream fos = new FileOutputStream(strOutFile);
        try {
            tmpZipCipherUtil.decryptStream(tmpStream,fos,strKey);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return fos;
    }

    //添加加密文件夹。
    public String AddZipEncrypt(String strPath,String strKey)  throws IOException{
        ZipCipherUtil tmpZipCipherUtil = new ZipCipherUtil();
        File temp = new File(UUID.randomUUID().toString() + ".tmp");
        temp.deleteOnExit();
        try {
            tmpZipCipherUtil.encryptZip(strPath,temp.getAbsolutePath(),strKey);
        } catch (Exception e) {
            e.printStackTrace();
        }
        NamedStreamable.FileWrapper file = new NamedStreamable.FileWrapper(new File(temp.getAbsolutePath()));
        MerkleNode addResult = ipfs.add(file).get(0);
        temp.delete();
        return addResult.hash.toString();
    }
    //获取加密文件夹
    public void GetZipEncrypt(String strHash,String strOutFile,String strKey)  throws IOException{
        File temp = new File(UUID.randomUUID().toString() + ".tmp");
        temp.deleteOnExit();
        ZipCipherUtil tmpZipCipherUtil = new ZipCipherUtil();
        Multihash FileHash = Multihash.fromBase58(strHash);
        //byte[] getResult = ipfs.cat(FileHash);
        byte[] FileByte = ipfs.cat(FileHash);
        File outputFile = new File(temp.getAbsolutePath());
        FileOutputStream outputFileStream = null;

        // try to open file output.txt
        try {
            outputFileStream = new FileOutputStream(outputFile);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        try {
            outputFileStream.write(FileByte);
            outputFileStream.close();
        } catch (IOException e1) {
            e1.printStackTrace();
        }
        OutputStream fos = null;
        try {
            tmpZipCipherUtil.decryptUnzip(temp.getAbsolutePath(),strOutFile,strKey);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
