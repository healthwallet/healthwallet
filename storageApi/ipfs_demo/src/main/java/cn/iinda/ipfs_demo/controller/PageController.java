package cn.iinda.ipfs_demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.nio.file.Paths;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @version V3.0
 * @Title: PageController
 * @Company: 成都影达科技有限公司
 * @Description: 描述
 * @author: 东进
 * @date 2018-02-26 15:58
 */

@Controller
public class PageController {

    @GetMapping("demo")
    public String demo() {
        System.out.println("demo");
        return "demo";
    }

    @RequestMapping("dicomviewer")
    public String dicomviewer(HttpServletRequest request, Model model) {

        String userAgent = request.getHeader("USER-AGENT").toLowerCase();
        String imageType = "dicom";
        //
        //查询判断是dicom图像还是jpg图像
        //
        String urls = request.getParameter("urls");
        String dicompage = "../../engin/ipacsdvpc.html?urls=" + urls;
        if (null == userAgent) {
            userAgent = "";
        }
        if (check(userAgent).equals("Phone") || check(userAgent).equals("Table")) {
            dicompage = "../../engin/ipacsdvtab.html?urls=" + urls;
        }
        if ("image".equals(imageType)) {
            dicompage = "../../engin/ipacsdvus.html?urls=" + urls;
        }
        model.addAttribute("type", "image");
        model.addAttribute("dicompage", dicompage);
        return "dicomviewer";
    }

    //获取访问设备类型
    public String check(String userAgent) {
        String phoneReg = "\\b(ip(hone|od)|android|opera m(ob|in)i|windows (phone|ce)|blackberry"
                + "|s(ymbian|eries60|amsung)|p(laybook|alm|rofile/midp|laystation portable)|nokia|fennec|htc[-_]"
                + "|mobile|up.browser|[1-4][0-9]{2}x[1-4][0-9]{2})\\b";
        String tableReg = "\\b(ipad|tablet|(Nexus 7)|up.browser|[1-4][0-9]{2}x[1-4][0-9]{2})\\b";
        Pattern phonePat = Pattern.compile(phoneReg, Pattern.CASE_INSENSITIVE);
        Pattern tablePat = Pattern.compile(tableReg, Pattern.CASE_INSENSITIVE);
        if (null == userAgent) {
            userAgent = "";
        }
        // 匹配
        Matcher matcherPhone = phonePat.matcher(userAgent);
        Matcher matcherTable = tablePat.matcher(userAgent);

        if (matcherTable.find()) {
            return "Table";
        } else if (matcherPhone.find()) {
            return "Table";
        } else {
            return "PC";
        }
    }

    //获取访问者IP
    public String getIpAddr(HttpServletRequest request) {
        String ip = request.getHeader("x-forwarded-for");
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
