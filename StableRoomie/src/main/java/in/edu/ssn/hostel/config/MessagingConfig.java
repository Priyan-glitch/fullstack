package in.edu.ssn.hostel.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "app.messaging.enabled", havingValue = "true")
public class MessagingConfig {

    public static final String PREFERENCE_QUEUE = "student-preferences";

    @Bean
    Queue preferenceQueue() {
        return new Queue(PREFERENCE_QUEUE, true);
    }

    @Bean
    MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
