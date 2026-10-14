package com.stableroomies.allocationservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.allocation.exchange:allocation.exchange}")
    private String exchange;

    @Value("${rabbitmq.allocation.queue:allocation.queue}")
    private String queue;

    @Value("${rabbitmq.allocation.routing-key:allocation.trigger}")
    private String routingKey;

    @Bean
    public Queue allocationQueue() {
        return QueueBuilder.durable(queue).build();
    }

    @Bean
    public TopicExchange allocationExchange() {
        return new TopicExchange(exchange);
    }

    @Bean
    public Binding allocationBinding(Queue allocationQueue, TopicExchange allocationExchange) {
        return BindingBuilder.bind(allocationQueue).to(allocationExchange).with(routingKey);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}
