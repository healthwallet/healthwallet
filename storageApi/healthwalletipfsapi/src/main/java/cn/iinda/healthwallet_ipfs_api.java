package cn.iinda;
import com.sun.org.apache.bcel.internal.generic.GOTO;
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
import java.io.FileInputStream;
import java.lang.Byte;
import java.nio.file.*;
import java.util.*;
import java.util.function.*;
import java.util.stream.*;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;
import  cn.iinda.ZipCipherUtil;
import org.omg.CORBA.INTERNAL;
//import sun.net.www.http.HttpClient;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;

//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.taozhiye.entity.User;
//import com.taozhiye.service.UserService;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;
import org.apache.http.util.EntityUtils;
//import org.springframework.stereotype.Controller;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.ResponseBody;

//import com.alibaba.fastjson.JSONArray;
//import com.alibaba.fastjson.JSONObject;

//Import java.io.serializable

import java.util.Map;
import java.util.Map.Entry;

public class healthwallet_ipfs_api {
    static public Logger LOGGER = LogManager.getLogger(healthwallet_ipfs_api.class.getName());
    private  IPFS ipfs;
    int intIPFS =0;
    ArrayList listIPFS = new ArrayList();
    //连接字符串：类似"/ip4/127.0.0.1/tcp/5001"；
    public  healthwallet_ipfs_api(String connstr) {
        String []tmpCon = connstr.split("\\|");
        for(int i=0;i<tmpCon.length;i++){
            try {
                ipfs = new IPFS(new MultiAddress(tmpCon[i]));
                listIPFS.add(ipfs);
                LOGGER.info(tmpCon[i]+"connect success!");
            } catch (Exception e) {
                intIPFS++;
                LOGGER.error(tmpCon[i]+"connect fail!");
                printApiStackTrace(e);
            }

        }
        ipfs = (IPFS)listIPFS.get(0);


    }
    static public void printApiStackTrace(Throwable oThrowable){
        if (oThrowable == null)return;
        StackTraceElement[] oStackArray = oThrowable.getStackTrace();
        String sInfo = oThrowable.toString() + "\n";

        for (int i = 0; i < oStackArray.length; i++){
            StackTraceElement ste = oStackArray[i];
            sInfo += "\tat ";
            sInfo += ste.getClassName()+"."+ste.getMethodName()+"("+ste.getFileName()+":"+ste.getLineNumber()+")\n";

        }
        LOGGER.error(sInfo);
    }
    //添加文件。指定文件路径
    public String AddFile(String strPath)  throws IOException{
        LOGGER.info("Add File begin!"+" file:"+strPath);
        ipfs = ipfsCheck();
        NamedStreamable.FileWrapper file = new NamedStreamable.FileWrapper(new File(strPath));
        MerkleNode addResult = ipfs.add(file).get(0);
        LOGGER.info("Add File success!"+" file:"+strPath+" hash:"+addResult.hash);
        return addResult.hash.toString();
    }
    //获取文件
    public byte[] GetFile(String strHash)  throws IOException{
        LOGGER.info("get File begin!"+" hash:"+strHash);
        ipfs = ipfsCheck();
        Multihash FileHash = Multihash.fromBase58(strHash);
        byte[] getResult = ipfs.cat(FileHash);
        LOGGER.info("get File success!"+" hash:"+strHash);
        return getResult;
    }
    //添加文件。指定文件流
    public String AddFile(InputStream iStream,String strFileName)  throws IOException{
        LOGGER.info("Add File begin!"+" file:"+strFileName);
        ipfs = ipfsCheck();
        NamedStreamable.StreamWrapper stream = new NamedStreamable.StreamWrapper(iStream);
        MerkleNode addResult = ipfs.add(stream).get(0);
        LOGGER.info("Add File success!"+" file:"+strFileName+" hash:"+addResult.hash);
        return addResult.hash.toString();
    }


    //添加加密文件,小文件，采用临时文件的方式。
    public String AddFileEncrypt(String strPath,String strKey)  throws IOException{
        healthwallet_ipfs_api.LOGGER.info("AddFileEncrypt Begin add file!"+" file:"+strPath);
        ipfs = ipfsCheck();
        ZipCipherUtil tmpZipCipherUtil = new ZipCipherUtil();
        File temp = new File(UUID.randomUUID().toString() + ".tmp");
        temp.deleteOnExit();
        try {
            tmpZipCipherUtil.encryptFile(strPath,temp.getAbsolutePath(),strKey);
        } catch (Exception e) {
            LOGGER.error("Encrypt file fail!");
            printApiStackTrace(e);
        }
        NamedStreamable.FileWrapper file = new NamedStreamable.FileWrapper(new File(temp.getAbsolutePath()));
        MerkleNode addResult = ipfs.add(file).get(0);
        temp.delete();
        HttpClient client = HttpClients.createDefault();
        HttpPost request2 = new HttpPost("http://"+ipfs.host+":9094/pins/"+addResult.hash.toString());
        HttpResponse response2 = client.execute(request2);
        try {
            HttpEntity entity = response2.getEntity();
            if (entity != null) {
                healthwallet_ipfs_api.LOGGER.info("--------------------------------------");
                healthwallet_ipfs_api.LOGGER.info("Response content: " + EntityUtils.toString(entity, "UTF-8"));  //编码
                healthwallet_ipfs_api.LOGGER.info("--------------------------------------");
            }
        } finally {

        }
        healthwallet_ipfs_api.LOGGER.info("AddFileEncrypt Begin add file!"+" file:"+strPath);
        //*/
        return addResult.hash.toString();
    }

    //添加加密文件。
    public String AddStreamFileEncrypt(InputStream iStream,String strFileName,String strKey)  throws IOException{
        healthwallet_ipfs_api.LOGGER.info("AddStreamFileEncrypt Begin add file!"+" file:"+strFileName);
        ipfs = ipfsCheck();
        InputStream encyrStream = null;
        ZipCipherUtil tmpZipCipherUtil = new ZipCipherUtil();
        try {
            encyrStream = tmpZipCipherUtil.encryptStream(iStream,strKey);
        } catch (Exception e) {
            LOGGER.error("Encrypt file fail!");
            printApiStackTrace(e);
        }
        NamedStreamable.StreamWrapper stream = new NamedStreamable.StreamWrapper(encyrStream);
        MerkleNode addResult = ipfs.add(stream).get(0);
        iStream.close();
        encyrStream.close();
        try {
        HttpClient client = HttpClients.createDefault();
        HttpPost request2 = new HttpPost("http://"+ipfs.host+":9094/pins/"+addResult.hash.toString());
        ///*
        LOGGER.info("AddStreamFileEncrypt Add File success!"+" file:"+strFileName+" hash:"+addResult.hash);
        healthwallet_ipfs_api.LOGGER.info("AddStreamFileEncrypt Begin cluster sync!"+" file:"+strFileName+" hash:"+addResult.hash);
        HttpResponse response2 = client.execute(request2);

            HttpEntity entity = response2.getEntity();
            if (entity != null) {
                healthwallet_ipfs_api.LOGGER.info("--------------------------------------");
                healthwallet_ipfs_api.LOGGER.info("Response content: " + EntityUtils.toString(entity, "UTF-8"));  //编码
                healthwallet_ipfs_api.LOGGER.info("--------------------------------------");
            }
        }catch (Exception e) {
            healthwallet_ipfs_api.printApiStackTrace(e);
        }
        finally {

        }
        healthwallet_ipfs_api.LOGGER.info("AddStreamFileEncrypt Cluster sync end!"+" file:"+strFileName+" hash:"+addResult.hash);
        //*/
        return addResult.hash.toString();
    }
    //获取加密文件
    public void GetFileEncrypt(String strOutFile,String strHash,String strKey)  throws IOException{
        healthwallet_ipfs_api.LOGGER.info("Begin get file!"+" file:"+strOutFile+" hash:"+strHash);
        ipfs = ipfsCheck();
        ZipCipherUtil tmpZipCipherUtil = new ZipCipherUtil();
        Multihash FileHash = Multihash.fromBase58(strHash);
        InputStream tmpStream = ipfs.catStream(FileHash);
        FileOutputStream outputFileStream = null;

        File file = new File(strOutFile);
        File fileParent = file.getParentFile();
        if(!fileParent.exists()){
            fileParent.mkdirs();
        }
        FileOutputStream fos = new FileOutputStream(file);
        try {
            tmpZipCipherUtil.decryptStream(tmpStream,fos,strKey);
        } catch (Exception e) {
            e.printStackTrace();
        }
        fos.close();
        healthwallet_ipfs_api.LOGGER.info("Get file end!"+" file:"+strOutFile+" hash:"+strHash);
    }
    //获取加密文件
    public InputStream GetInStreamEncrypt(String strHash,String strKey)  throws IOException{
        healthwallet_ipfs_api.LOGGER.info("Begin get fileSteam!"+" hash:"+strHash);
        ipfs = ipfsCheck();
        ZipCipherUtil tmpZipCipherUtil = new ZipCipherUtil();
        Multihash FileHash = Multihash.fromBase58(strHash);
        InputStream tmpStream = ipfs.catStream(FileHash);
        FileOutputStream outputFileStream = null;

        InputStream tmpStream1 =null;
        try {
            tmpStream1 = (InputStream) tmpZipCipherUtil.decryptStream(tmpStream,strKey);
        } catch (Exception e) {
            e.printStackTrace();
        }
        healthwallet_ipfs_api.LOGGER.info("Get file end!"+" hash:"+strHash);
        return tmpStream1;

    }

    //添加加密文件夹。没有加入集群
    public String AddZipEncrypt(String strPath,String strKey)  throws IOException{
        healthwallet_ipfs_api.LOGGER.info("AddZipEncrypt Begin add zipfile!"+" file:"+strPath);
        ipfs = ipfsCheck();
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
        LOGGER.info("Add File success!"+" file:"+strPath+" hash:"+addResult.hash);
        return addResult.hash.toString();
    }
    //获取加密文件夹
    public void GetZipEncrypt(String strHash,String strOutFile,String strKey)  throws IOException{
        healthwallet_ipfs_api.LOGGER.info("Begin get GetZipEncrypt!"+" hash:"+strHash);
        ipfs = ipfsCheck();
        File temp = new File(UUID.randomUUID().toString() + ".tmp");
        temp.deleteOnExit();
        ZipCipherUtil tmpZipCipherUtil = new ZipCipherUtil();
        Multihash FileHash = Multihash.fromBase58(strHash);
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
            healthwallet_ipfs_api.LOGGER.info("Get file end!"+" file:"+strOutFile+" hash:"+strHash);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    public  boolean networkcheck(IPFS parIPFS)
    {
        try {
            ipfs =(IPFS) listIPFS.get(intIPFS);
            ipfs.id();
            return true;
        } catch (IOException e1) {
            return false;
        }

    }
    public IPFS ipfsCheck()
    {
        IPFS tmpipfs = null;
        for(int i=0;i<listIPFS.size();i++)
        {
            tmpipfs = (IPFS)listIPFS.get(i);
            if (networkcheck(tmpipfs))
            {
                return tmpipfs;
            }
        }
        return tmpipfs;
    }
}
