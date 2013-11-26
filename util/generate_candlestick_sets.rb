#!/usr/bin/env ruby

require 'pry-debugger'
require 'active_support/all'


#"./prog.rb start-date end-date file-period ema-period ema-period-unit"

if(ARGV.length != 5)
	puts "./prog.rb start-date end-date file-period ema-period ema-period-unit"
	exit
end

start_date = DateTime.new( ARGV[0].split('-')[2].to_i, ARGV[0].split('-')[0].to_i, ARGV[0].split('-')[1].to_i )
end_date = DateTime.new( ARGV[1].split('-')[2].to_i, ARGV[1].split('-')[0].to_i, ARGV[1].split('-')[1].to_i )

lower_date_limit = start_date
period = 1.minutes

if((ARGV[2].match /\d/).length > 0)
	duration_increment_val = ARGV[2].gsub(/[^0-9]/, '').to_i
	unit = ARGV[2].gsub(/[0-9]/, '')
	case unit
	when 'd'
		period = duration_increment_val.days
	when 'm'
		period = duration_increment_val.minutes
	when 'w'
		period = duration_increment_val.weeks
	else
		period = duration_increment_val.dayss
	end
end

upper_date_limit = lower_date_limit + period

ema_period = ARGV[3]
ema_period_unit = ARGV[4]

binding.pry
while( upper_date_limit <= end_date )
	fork do
		system 'node util/candleCalculator.js ' + lower_date_limit.strftime('%s') + ' ' + upper_date_limit.strftime('%s') + ' ' + ema_period + ' ' + ema_period_unit
	end
	lower_date_limit += period
	upper_date_limit += period
end



