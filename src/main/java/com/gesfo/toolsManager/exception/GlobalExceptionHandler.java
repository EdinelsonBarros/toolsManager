package com.gesfo.toolsManager.exception;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.http.HttpStatus;

@ControllerAdvice
public class GlobalExceptionHandler {

	/*
	 * // Apenas para exceptions não tratadas da sua lógica de negócio
	 * 
	 * @ExceptionHandler(Exception.class) public ModelAndView
	 * handleException(Exception ex) { ModelAndView mav = new
	 * ModelAndView("error/404"); mav.addObject("mensagem",
	 * "Ocorreu um erro inesperado: " + ex.getMessage());
	 * mav.setStatus(HttpStatus.INTERNAL_SERVER_ERROR); return mav; }
	 */
}