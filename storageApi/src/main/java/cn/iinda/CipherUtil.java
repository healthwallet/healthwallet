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

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
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
import javax.crypto.CipherInputStream;
import javax.crypto.CipherOutputStream;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

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

    static IvParameterSpec iv = new IvParameterSpec(rnd.generateSeed(16));

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
        cipher.init(Cipher.DECRYPT_MODE, key,iv);

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

        int keyLength = 256;
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

        int inLength = 0;
        boolean more = true;
        while (more) {
            inLength = in.read(inBytes);
            if (inLength == blockSize) {
                int outLength = cipher.update(inBytes, 0, blockSize, outBytes);
                //out.write(base64encoder.encode(outBytes));
                out.write(outBytes, 0, outLength);
            } else {
                more = false;
            }
        }
        if (inLength > 0)
            outBytes = cipher.doFinal(inBytes, 0, inLength);
        else
            outBytes = cipher.doFinal();
        out.write(outBytes);
    }
}