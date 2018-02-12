package cn.iinda;

import java.io.*;
import java.util.UUID;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;

public class ZipCipherUtil {
    static Logger logger = LogManager.getLogger(ZipCipherUtil.class.getName());
    /**
     * 对目录srcFile下的所有文件目录进行先压缩后加密,然后保存为destfile
     *
     * @param srcFile
     *            要操作的文件或文件夹
     * @param destfile
     *            压缩加密后存放的文件
     * @param keyStr
     *            密钥
     */
    public void encryptZip(String srcFile, String destfile, String keyStr) throws Exception {
        File temp = new File(UUID.randomUUID().toString() + ".zip");
        temp.deleteOnExit();
        // 先压缩文件
        new ZipUtil().zip(srcFile, temp.getAbsolutePath());
        // 对文件加密
        new CipherUtil().encrypt(temp.getAbsolutePath(), destfile, keyStr);
        temp.delete();
    }

    /**
     * 对文件srcfile进行先解密后解压缩,然后解压缩到目录destfile下
     *
     * @param srcfile
     *            要解密和解压缩的文件名
     * @param destfile
     *            解压缩后的目录
     * @param keyStr
     *            密钥
     */
    public void decryptUnzip(String srcfile, String destfile, String keyStr) throws Exception {
        File temp = new File(UUID.randomUUID().toString() + ".zip");
        temp.deleteOnExit();
        // 先对文件解密
        new CipherUtil().decrypt(srcfile, temp.getAbsolutePath(), keyStr);
        // 解压缩
        new ZipUtil().unZip(temp.getAbsolutePath(),destfile);
        temp.delete();
    }


    /**
     * 对目录srcFile下的所有文件目录进行先压缩后加密,然后保存为destfile
     *
     * @param srcFile
     *            要操作的文件或文件夹
     * @param destfile
     *            压缩加密后存放的文件
     */
    public void Zip(String srcFile, String destfile) throws Exception {
        // 先压缩文件
        new ZipUtil().zip(srcFile, destfile);
    }

    /**
     * 对文件srcfile进行先解密后解压缩,然后解压缩到目录destfile下
     *
     * @param srcfile
     *            要解密和解压缩的文件名
     * @param destfile
     *            解压缩后的目录
     */
    public void Unzip(String srcfile, String destfile) throws Exception {
        // 解压缩
        new ZipUtil().unZip(srcfile,destfile);
    }

    /**
     * 对目录srcFile下的所有文件目录进行先压缩后加密,然后保存为destfile
     *
     * @param srcFile
     *            要操作的文件或文件夹
     * @param destfile
     *            压缩加密后存放的文件
     * @param keyStr
     *            密钥
     */
    public void encryptFile(String srcFile, String destfile, String keyStr) throws Exception {
        // 对文件加密
        new CipherUtil().encrypt(srcFile, destfile, keyStr);
    }

    /**
     * 对文件srcfile进行先解密后解压缩,然后解压缩到目录destfile下
     *
     * @param srcfile
     *            要解密和解压缩的文件名
     * @param destfile
     *            解压缩后的目录
     * @param keyStr
     *            密钥
     */
    public void decryptFile(String srcfile, String destfile, String keyStr) throws Exception {
        // 先对文件解密
        new CipherUtil().decrypt(srcfile, destfile, keyStr);
    }

    /**
     * 对流srcStream进行解密到流destStream下
     *
     * @param srcStream
     *            要解密的流
     * @param destStream
     *            解密后的流
     * @param keyStr
     *            密钥
     */
    public void decryptStream(InputStream srcStream, OutputStream  destStream, String keyStr) throws Exception {
        // 先对文件解密
        new CipherUtil().decryptStream(srcStream, destStream, keyStr);
    }

    public static void main(String[] args) throws Exception {
        long l1 = System.currentTimeMillis();

        //加密
        new CipherUtil().encrypt("/Users/lwy1218/test/temp.jpg", "/Users/lwy1218/test/temp345", "12345");
        //解密
        new CipherUtil().decrypt("/Users/lwy1218/test/temp345", "/Users/lwy1218/test/temp4.jpg", "12345");

        //加密
        new ZipCipherUtil().encryptZip("/Users/lwy1218/test/temp.jpg", "/Users/lwy1218/test/temp.zip", "12345");
        //解密
        new ZipCipherUtil().decryptUnzip("/Users/lwy1218/test/temp.zip", "/Users/lwy1218/test/temp", "12345");

        long l2 = System.currentTimeMillis();
        logger.info((l2 - l1) + "毫秒.");
        logger.info(((l2 - l1) / 1000) + "秒.");
    }
}