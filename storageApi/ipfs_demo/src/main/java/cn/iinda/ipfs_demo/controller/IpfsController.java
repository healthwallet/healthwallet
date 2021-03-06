package cn.iinda.ipfs_demo.controller;

import cn.iinda.ipfs_demo.model.ElectronicFilmResult;
import com.Ostermiller.util.CircularByteBuffer;
import org.apache.catalina.servlet4preview.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import cn.iinda.healthwallet_ipfs_api;

import javax.crypto.ShortBufferException;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.logging.Logger;

import static java.lang.Thread.sleep;


/**
 * @version V3.0
 * @Title: IpfsController
 * @Company: 成都影达科技有限公司
 * @Description: 处理文件上传下载
 * @author: 东进
 * @date 2018-02-26 16:23
 */
@RestController
public class IpfsController {


    public static final String ROOT = "upload-dir";

    private final ResourceLoader resourceLoader;
    healthwallet_ipfs_api ipfs;

    @Autowired
    public IpfsController(ResourceLoader resourceLoader,@Value("${server.connstr}") String connstr) {
        ipfs = new healthwallet_ipfs_api(connstr);
        this.resourceLoader = resourceLoader;
    }
    final int blockSize = 2*1024*1024;
    int gindex = 1;
    final byte[] inBytes = new byte[blockSize];
    CircularByteBuffer cbb = new CircularByteBuffer(blockSize);
    Queue <MultipartFile> qfile = new LinkedList<MultipartFile>();
    Thread gthead;
    int iread = 0;
    //处理文件上传
    @RequestMapping(value = "/testuploadimg", method = RequestMethod.POST)

    public String uploadImg(@RequestParam("myfile") MultipartFile myfile, @RequestParam("pass") String pass, @RequestParam("index") int index,
                            @RequestParam("total") int total,@RequestParam("name") String name,
                            HttpServletRequest request) {
        class MyThread extends Thread
        {
            private String hash;

            public void run()
            {
                String fileName = myfile.getOriginalFilename();
                String filePath = request.getSession().getServletContext().getRealPath("imge/");
                try {
                    //uploadFile(myfile.getBytes(), filePath, fileName);

                    hash = ipfs.AddStreamFileEncrypt(cbb.getInputStream(), name, pass);
                    //hash2 = ipfs.AddFileEncrypt(filePath+fileName, pass);
                } catch (Exception e) {
                    e.printStackTrace();
                    System.out.printf("有错");
                }
            }
        }
        gindex = index;
        if(1 == gindex)
        {
            cbb = new CircularByteBuffer(10*1024*1024);
            MyThread thread = new MyThread();
            gthead = thread;
            thread.start();
        }
        try {
            int inLength = 0;
            boolean more = true;
            InputStream tmpStream = myfile.getInputStream();
            while ((inLength = tmpStream.read(inBytes))>=0) {
                try {
                    byte[] tmpbuf = new byte[inLength];
                    System.arraycopy(inBytes,0,tmpbuf,0,inLength);
                    cbb.getOutputStream().write(tmpbuf);
                    iread += inLength;
                } catch (Exception e) {
                    healthwallet_ipfs_api.printApiStackTrace(e);
                }
                sleep(10);
                //out.write(base64encoder.encode(outBytes));

            }
            if(index == total){
                cbb.getOutputStream().close();
            }


        } catch (Exception e) {
            e.printStackTrace();
        }
        if(gindex >= total){
            try {
                gthead.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return ((MyThread)gthead).hash;
        }
        return "continue";
    }

    @GetMapping(value = "showImg/{hash}/{password}")
    public ElectronicFilmResult showImg(HttpServletRequest request, @PathVariable("hash") String hash, @PathVariable("password") String password) throws IOException {
        if (null == hash || hash.trim().equals(""))
            return ElectronicFilmResult.build(400, "hash值不能为空");
        if (null == password || password.trim().equals(""))
            return ElectronicFilmResult.build(400, "password不能为空");
        List<String> list = new ArrayList<>();
        String url = "urls=[";
        if (hash.contains(",")) {
            String[] strs = hash.split(",");
            for (int i = 0, len = strs.length; i < len; i++) {
                Date date = new Date();
                String fileName = date.getTime() + ".dcm";
                ipfs.GetFileEncrypt("src/main/webapp/" + fileName,strs[i].toString() , password);
                if (i != 0)
                    url = url + ",";
                url = url + "\"http://127.0.0.1:8087/" + fileName + "\"";
            }
        } else {
            Date date = new Date();
            String fileName = date.getTime()+"";
            //ipfs.GetFileEncrypt("/tmp/outtest.fq.gz",hash , password);
            ipfs.GetFileEncrypt("src/main/webapp/" + fileName,hash , password);
            url = url + "\"http://127.0.0.1:8087/" + fileName + "\"";
        }
        url = url + "]";
        System.out.printf(url);
//        return ElectronicFilmResult.ok("urls=[\"http://127.0.0.1:8087/" + fileName + "\"]");
        return ElectronicFilmResult.ok(url);
    }


    public static void uploadFile(byte[] file, String filePath, String fileName) throws Exception {
        File targetFile = new File(filePath);
        if (!targetFile.exists()) {
            targetFile.mkdirs();
        }
        FileOutputStream out = new FileOutputStream(filePath + fileName);
        out.write(file);
        out.flush();
        out.close();
    }

}
