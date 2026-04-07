package com.gesfo.toolsManager.exception;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.boot.webmvc.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request, Model model) {
        
        Integer statusCode = (Integer) request.getAttribute(
            "jakarta.servlet.error.status_code"
        );

        if (statusCode == null) statusCode = 500;

        model.addAttribute("status", statusCode);

        return switch (statusCode) {
            case 404 -> "error/404";
            case 403 -> "error/403";
            default  -> "error/generico";
        };
    }
}