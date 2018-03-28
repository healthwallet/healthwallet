package cn.iinda;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.FileNotFoundException;
import java.security.Key;
import java.security.SecureRandom;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.Security;

import javax.crypto.*;
import javax.crypto.spec.SecretKeySpec;
import java.security.GeneralSecurityException;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;
import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;
import javax.crypto.spec.IvParameterSpec;
import java.io.UnsupportedEncodingException;
import java.security.Security;
import java.util.Arrays;
import com.Ostermiller.util.CircularByteBuffer;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.Security;
import java.util.Arrays;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import static java.lang.Thread.sleep;

/**
 * 使用AES对文件进行加密和解密
 *
 */
public class CipherUtil {
    /**
     * 使用AES对文件进行加密和解密
     *
     */
    private static String type = "AES";
    private final static BASE64Encoder base64encoder = new BASE64Encoder();
    private final static BASE64Decoder base64decoder = new BASE64Decoder();
    static SecureRandom rnd = new SecureRandom();
    static byte[] bseed= {2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7};

    //rnd.generateSeed(16)
    static IvParameterSpec iv = new IvParameterSpec(bseed);

    /**
     * 把文件srcFile加密后存储为destFile
     * @param srcFile     加密前的文件
     * @param destFile    加密后的文件
     * @param privateKey  密钥
     * @throws GeneralSecurityException
     * @throws IOException
     */
    public void encrypt(String srcFile, String destFile, String privateKey) throws GeneralSecurityException, IOException {
        Key key = getKey(privateKey);
        Cipher cipher = Cipher.getInstance(type + "/OFB/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, key,iv);

        FileInputStream fis = null;
        FileOutputStream fos = null;
        try {
            fis = new FileInputStream(srcFile);
            fos = new FileOutputStream(mkdirFiles(destFile));

            crypt(fis, fos, cipher);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (fis != null) {
                fis.close();
            }
            if (fos != null) {
                fos.close();
            }
        }
    }

    /**
     * 把文件srcFile解密后存储为destFile
     * @param srcFile     解密前的文件
     * @param destFile    解密后的文件
     * @param privateKey  密钥
     * @throws GeneralSecurityException
     * @throws IOException
     */
    public void decrypt(String srcFile, String destFile, String privateKey) throws GeneralSecurityException, IOException {
        Key key = getKey(privateKey);
        Cipher cipher = Cipher.getInstance(type + "/OFB/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, key,iv);
        FileInputStream fis = null;
        FileOutputStream fos = null;
        try {
            fis = new FileInputStream(srcFile);
            fos = new FileOutputStream(mkdirFiles(destFile));

            crypt(fis, fos, cipher);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (fis != null) {
                fis.close();
            }
            if (fos != null) {
                fos.close();
            }
        }
    }
    /**
     * 把流fis解密后存储为fos
     * @param fis     解密前的文件
     * @param fos    解密后的流
     * @param privateKey  密钥
     * @throws GeneralSecurityException
     * @throws IOException
     */
    public void encryptStream(InputStream fis, OutputStream fos, String privateKey) throws GeneralSecurityException, IOException {
        Key key = getKey(privateKey);
        Cipher cipher = Cipher.getInstance(type + "/OFB/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, key,iv);

        try {
            crypt(fis, fos, cipher);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * 把流fis解密后存储为fos
     * @param fis     解密前的文件
     * @param privateKey  密钥
     * @throws GeneralSecurityException
     * @throws IOException
     */
    public InputStream encryptStream(InputStream fis, String privateKey) throws GeneralSecurityException, IOException {
        Key key = getKey(privateKey);
        Cipher cipher = Cipher.getInstance(type + "/OFB/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, key,iv);
        InputStream reIs = null;
        try {
            reIs = crypt( fis, cipher);
        } catch (FileNotFoundException e) {
            healthwallet_ipfs_api.printApiStackTrace(e);
        } catch (IOException e) {
            healthwallet_ipfs_api.printApiStackTrace(e);
        }
        return  reIs;
    }

    /**
     * 把流fis解密后存储为fos
     * @param fis     解密前的文件
     * @param fos    解密后的流
     * @param privateKey  密钥
     * @throws GeneralSecurityException
     * @throws IOException
     */
    public void decryptStream(InputStream fis, OutputStream fos, String privateKey) throws GeneralSecurityException, IOException {
        Key key = getKey(privateKey);
        Cipher cipher = Cipher.getInstance(type + "/OFB/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, key,iv);

        try {
            crypt(fis, fos, cipher);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * 把流fis解密后存储为fos
     * @param fis     解密前的文件
     * @param privateKey  密钥
     * @throws GeneralSecurityException
     * @throws IOException
     */
    public InputStream decryptStream(InputStream fis, String privateKey) throws GeneralSecurityException, IOException {
        Key key = getKey(privateKey);
        Cipher cipher = Cipher.getInstance(type + "/OFB/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, key,iv);
        InputStream reIs = null;
        try {
            reIs = crypt( fis, cipher);
        } catch (FileNotFoundException e) {
            healthwallet_ipfs_api.printApiStackTrace(e);
        } catch (IOException e) {
            healthwallet_ipfs_api.printApiStackTrace(e);
        }
        return  reIs;
    }

    /**
     * 根据filePath创建相应的目录
     * @param filePath      要创建的文件路经
     * @return  file        文件
     * @throws IOException
     */
    private File mkdirFiles(String filePath) throws IOException {
        File file = new File(filePath);
        if (!file.getParentFile().exists()) {
            file.getParentFile().mkdirs();
        }
        file.createNewFile();

        return file;
    }

    /**
     * 生成指定字符串的密钥
     * @param secret        要生成密钥的字符串
     * @return secretKey    生成后的密钥
     * @throws GeneralSecurityException
     */
    private static Key getKey(String secret) throws GeneralSecurityException {
//        byte[] raw = new byte[]{'T', 'h', 'i', 's', 'I', 's', 'A', 'S', 'e', 'c', 'r', 'e', 't', 'K', 'e', 'y'};
//        Key skeySpec = new SecretKeySpec(raw, "AES");
//       return skeySpec;
//        try {
//            KeyGenerator kgen = KeyGenerator.getInstance(type);
//            kgen.init(128, new SecureRandom(secret.getBytes("UTF-8")));
//            SecretKey secretKey = kgen.generateKey();
//            return secretKey;
//        } catch (UnsupportedEncodingException e) {
//            e.printStackTrace();
//        }
//        return null;

        int keyLength = 128;
        byte[] keyBytes = new byte[keyLength / 8];
        SecretKeySpec key = null;
        try {
            Arrays.fill(keyBytes, (byte) 0x0);
            byte[] passwordBytes = secret.getBytes("UTF-8");
            int length = passwordBytes.length < keyBytes.length ? passwordBytes.length : keyBytes.length;
            System.arraycopy(passwordBytes, 0, keyBytes, 0, length);

            key = new SecretKeySpec(keyBytes, "AES");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        return key;
    }

    /**
     * 加密解密流
     * @param in        加密解密前的流
     * @param out       加密解密后的流
     * @param cipher    加密解密
     * @throws IOException
     * @throws GeneralSecurityException
     */
    private static void crypt(InputStream in, OutputStream out, Cipher cipher) throws IOException, GeneralSecurityException {
        int blockSize = cipher.getBlockSize() * 1000;
        int outputSize = cipher.getOutputSize(blockSize);

        byte[] inBytes = new byte[blockSize];
        byte[] outBytes = new byte[outputSize];

        int inLength = 0,linLength =0;
        int outLength = 0;
        boolean more = true;
        int readNum = 0;
        while ((inLength = in.read(inBytes)) >= 0) {
                linLength = inLength;
                outLength = cipher.update(inBytes, 0, inLength, outBytes);
                readNum+=outLength;
                //out.write(base64encoder.encode(outBytes));
                out.write(outBytes, 0, outLength);
        }

        outBytes = cipher.doFinal();
        out.write(outBytes);
    }
    /**
     * 加密解密流
     * @param in        加密解密前的流
     * @param cipher    加密解密
     * @throws IOException
     * @throws GeneralSecurityException
     */
    public static InputStream crypt(final InputStream in, final Cipher cipher) throws IOException, GeneralSecurityException {
        //final int blockSize = cipher.getBlockSize() * 1000;
        final int blockSize = 2*1024*1024;
        final int outputSize = cipher.getOutputSize(blockSize);

        final byte[] inBytes = new byte[blockSize];
        final byte[] outBytes = new byte[outputSize];
        final CircularByteBuffer cbb = new CircularByteBuffer(blockSize);
        new Thread(new Runnable() {
            public void run() {
                try {
                    int inLength = 0;
                    boolean more = true;
                    int readnum = 0;
                    while ((inLength = in.read(inBytes)) >= 0) {
                        int outLength = 0;
                        try {
                            outLength = cipher.update(inBytes, 0, inLength, outBytes);
                            readnum += outLength;
                            cbb.getOutputStream().write(outBytes, 0, outLength);
                        } catch (ShortBufferException e) {
                            healthwallet_ipfs_api.printApiStackTrace(e);
                        }
                        sleep(10);
                        //out.write(base64encoder.encode(outBytes));

                    }
                    byte[] tmpoutBytes = new byte[outputSize];
                    tmpoutBytes = cipher.doFinal();
                    cbb.getOutputStream().write(tmpoutBytes);
                    cbb.getOutputStream().close();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }).start();
         return cbb.getInputStream();
    }
}