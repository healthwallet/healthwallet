package cn.iinda.ipfs_demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class IpfsDemoApplication {


	private String msg;
	public static void main(String[] args) {
		SpringApplication.run(IpfsDemoApplication.class, args);
	}
}
